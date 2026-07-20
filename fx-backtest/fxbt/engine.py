"""Event-driven backtest engine.

Design goals:
  * No look-ahead: a signal computed from bar i is executed at bar i+1's open.
  * Realistic costs: spread and slippage are charged on every fill.
  * Risk-based sizing: position size derived from account risk and stop distance.
  * Stops: optional stop-loss / take-profit checked intrabar (high/low).

Simplifying assumptions (documented so you know what to tighten later):
  * The account currency equals the quote currency, so P&L = units * price move.
  * One position at a time (flip closes the old one and opens the new).
  * If both SL and TP fall inside the same bar, the stop-loss is assumed first.
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import List, Optional

from .data import Candle
from .strategy import Signal, Strategy


@dataclass
class BacktestConfig:
    initial_balance: float = 10_000.0
    pip_size: float = 0.01  # 0.01 for JPY pairs, 0.0001 for most others
    spread_pips: float = 0.8  # round-trip spread, split across bid/ask
    slippage_pips: float = 0.0
    # Sizing: if risk_per_trade and stop_loss_pips are set, size by risk.
    risk_per_trade: float = 0.01  # fraction of equity risked per trade
    fixed_units: Optional[float] = None  # fallback / override when no risk sizing
    stop_loss_pips: Optional[float] = 30.0
    take_profit_pips: Optional[float] = 60.0


@dataclass
class Trade:
    entry_time: datetime
    exit_time: datetime
    side: str  # "long" or "short"
    units: float
    entry_price: float
    exit_price: float
    pnl: float
    return_pct: float
    reason: str  # "signal", "stop_loss", "take_profit", "end_of_data"


@dataclass
class BacktestResult:
    config: BacktestConfig
    strategy_name: str
    trades: List[Trade] = field(default_factory=list)
    equity_curve: List[float] = field(default_factory=list)
    times: List[datetime] = field(default_factory=list)

    @property
    def final_balance(self) -> float:
        return self.equity_curve[-1] if self.equity_curve else self.config.initial_balance


class _Position:
    __slots__ = ("side", "units", "entry_price", "entry_time", "sl", "tp")

    def __init__(self, side, units, entry_price, entry_time, sl, tp):
        self.side: Signal = side
        self.units: float = units
        self.entry_price: float = entry_price
        self.entry_time: datetime = entry_time
        self.sl: Optional[float] = sl
        self.tp: Optional[float] = tp


class Backtester:
    def __init__(self, config: Optional[BacktestConfig] = None):
        self.config = config or BacktestConfig()

    def run(self, candles: List[Candle], strategy: Strategy) -> BacktestResult:
        cfg = self.config
        if len(candles) < 2:
            raise ValueError("need at least 2 candles to backtest")

        signals = strategy.generate(candles)
        if len(signals) != len(candles):
            raise ValueError("strategy must return one signal per candle")
        warmup = strategy.warmup()

        result = BacktestResult(config=cfg, strategy_name=strategy.name)
        balance = cfg.initial_balance
        pos: Optional[_Position] = None

        half_spread = cfg.spread_pips * cfg.pip_size / 2.0
        slip = cfg.slippage_pips * cfg.pip_size

        for i in range(1, len(candles)):
            bar = candles[i]

            # 1) Manage an open position against this bar's range (SL/TP).
            if pos is not None:
                exit_ref, reason = self._check_stops(pos, bar)
                if exit_ref is not None:
                    fill = self._exit_fill(pos.side, exit_ref, half_spread, slip)
                    balance += self._pnl(pos, fill)
                    result.trades.append(self._make_trade(pos, bar.time, fill, reason))
                    pos = None

            # 2) Act on the signal from the *previous* bar at this bar's open.
            target = signals[i - 1]
            if i - 1 < warmup:
                target = Signal.FLAT

            current = pos.side if pos is not None else Signal.FLAT
            if target != current:
                if pos is not None:
                    fill = self._exit_fill(pos.side, bar.open, half_spread, slip)
                    balance += self._pnl(pos, fill)
                    result.trades.append(self._make_trade(pos, bar.time, fill, "signal"))
                    pos = None
                if target != Signal.FLAT:
                    pos = self._open(target, bar, balance, half_spread, slip)

            # 3) Mark-to-market equity at this bar's close.
            equity = balance + self._unrealized(pos, bar.close)
            result.equity_curve.append(equity)
            result.times.append(bar.time)

        # Close any dangling position at the last close.
        if pos is not None:
            last = candles[-1]
            fill = self._exit_fill(pos.side, last.close, half_spread, slip)
            balance += self._pnl(pos, fill)
            result.trades.append(self._make_trade(pos, last.time, fill, "end_of_data"))
            if result.equity_curve:
                result.equity_curve[-1] = balance

        return result

    # -- helpers ---------------------------------------------------------

    def _open(self, side, bar, balance, half_spread, slip) -> _Position:
        cfg = self.config
        entry = self._entry_fill(side, bar.open, half_spread, slip)

        sl_price = tp_price = None
        if cfg.stop_loss_pips is not None:
            dist = cfg.stop_loss_pips * cfg.pip_size
            sl_price = entry - dist if side == Signal.LONG else entry + dist
        if cfg.take_profit_pips is not None:
            dist = cfg.take_profit_pips * cfg.pip_size
            tp_price = entry + dist if side == Signal.LONG else entry - dist

        units = self._size(balance)
        return _Position(side, units, entry, bar.time, sl_price, tp_price)

    def _size(self, balance: float) -> float:
        cfg = self.config
        if cfg.risk_per_trade and cfg.stop_loss_pips:
            risk_amount = balance * cfg.risk_per_trade
            per_unit_risk = cfg.stop_loss_pips * cfg.pip_size
            if per_unit_risk > 0:
                return risk_amount / per_unit_risk
        if cfg.fixed_units:
            return cfg.fixed_units
        # Last resort: notional roughly equal to balance.
        return balance

    def _check_stops(self, pos: _Position, bar: Candle):
        """Return (exit_reference_price, reason) if a stop triggers this bar."""
        if pos.side == Signal.LONG:
            if pos.sl is not None and bar.low <= pos.sl:
                return pos.sl, "stop_loss"
            if pos.tp is not None and bar.high >= pos.tp:
                return pos.tp, "take_profit"
        else:  # SHORT
            if pos.sl is not None and bar.high >= pos.sl:
                return pos.sl, "stop_loss"
            if pos.tp is not None and bar.low <= pos.tp:
                return pos.tp, "take_profit"
        return None, ""

    @staticmethod
    def _entry_fill(side, ref, half_spread, slip):
        # Buy at ask, sell at bid; slippage always adverse.
        if side == Signal.LONG:
            return ref + half_spread + slip
        return ref - half_spread - slip

    @staticmethod
    def _exit_fill(side, ref, half_spread, slip):
        # Closing a long means selling (bid); closing a short means buying (ask).
        if side == Signal.LONG:
            return ref - half_spread - slip
        return ref + half_spread + slip

    @staticmethod
    def _pnl(pos: _Position, exit_fill: float) -> float:
        if pos.side == Signal.LONG:
            return pos.units * (exit_fill - pos.entry_price)
        return pos.units * (pos.entry_price - exit_fill)

    @staticmethod
    def _unrealized(pos: Optional[_Position], price: float) -> float:
        if pos is None:
            return 0.0
        if pos.side == Signal.LONG:
            return pos.units * (price - pos.entry_price)
        return pos.units * (pos.entry_price - price)

    def _make_trade(self, pos: _Position, exit_time, exit_fill, reason) -> Trade:
        pnl = self._pnl(pos, exit_fill)
        notional = pos.units * pos.entry_price
        return Trade(
            entry_time=pos.entry_time,
            exit_time=exit_time,
            side="long" if pos.side == Signal.LONG else "short",
            units=pos.units,
            entry_price=pos.entry_price,
            exit_price=exit_fill,
            pnl=pnl,
            return_pct=(pnl / notional * 100.0) if notional else 0.0,
            reason=reason,
        )
