"""Strategy interface and a couple of reference strategies.

A strategy looks at candles up to (and including) index `i` and returns a
desired signal for the *next* bar's open. The engine handles execution,
costs, sizing, and stops - strategies only express intent. This separation
keeps look-ahead bias out: a strategy may only read candles[:i+1].
"""

from __future__ import annotations

import enum
from typing import List, Optional

from .data import Candle
from .indicators import rsi, sma


class Signal(enum.IntEnum):
    FLAT = 0
    LONG = 1
    SHORT = -1


class Strategy:
    """Base class. Subclasses implement `generate`."""

    name: str = "strategy"

    def warmup(self) -> int:
        """Number of leading bars to skip before signals are trustworthy."""
        return 0

    def generate(self, candles: List[Candle]) -> List[Signal]:
        """Return a signal per bar, same length as `candles`."""
        raise NotImplementedError


class SmaCrossStrategy(Strategy):
    """Go long when fast SMA is above slow SMA, short when below."""

    def __init__(self, fast: int = 20, slow: int = 50, allow_short: bool = True):
        if fast >= slow:
            raise ValueError("fast period must be shorter than slow period")
        self.fast = fast
        self.slow = slow
        self.allow_short = allow_short
        self.name = f"sma_cross({fast},{slow})"

    def warmup(self) -> int:
        return self.slow

    def generate(self, candles: List[Candle]) -> List[Signal]:
        closes = [c.close for c in candles]
        fast = sma(closes, self.fast)
        slow = sma(closes, self.slow)
        signals: List[Signal] = []
        for f, s in zip(fast, slow):
            if f is None or s is None:
                signals.append(Signal.FLAT)
            elif f > s:
                signals.append(Signal.LONG)
            elif f < s:
                signals.append(Signal.SHORT if self.allow_short else Signal.FLAT)
            else:
                signals.append(Signal.FLAT)
        return signals


class RsiStrategy(Strategy):
    """Mean-reversion: long when oversold, short when overbought, flat between."""

    def __init__(
        self,
        period: int = 14,
        oversold: float = 30.0,
        overbought: float = 70.0,
        allow_short: bool = True,
    ):
        self.period = period
        self.oversold = oversold
        self.overbought = overbought
        self.allow_short = allow_short
        self.name = f"rsi({period},{oversold:.0f}/{overbought:.0f})"

    def warmup(self) -> int:
        return self.period + 1

    def generate(self, candles: List[Candle]) -> List[Signal]:
        closes = [c.close for c in candles]
        values = rsi(closes, self.period)
        signals: List[Signal] = []
        prev: Signal = Signal.FLAT
        for v in values:
            if v is None:
                signals.append(Signal.FLAT)
                prev = Signal.FLAT
                continue
            if v <= self.oversold:
                sig = Signal.LONG
            elif v >= self.overbought:
                sig = Signal.SHORT if self.allow_short else Signal.FLAT
            else:
                # Exit back to flat once RSI returns to the neutral zone.
                sig = Signal.FLAT
            signals.append(sig)
            prev = sig
        return signals
