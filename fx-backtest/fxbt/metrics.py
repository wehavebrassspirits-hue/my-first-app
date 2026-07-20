"""Performance metrics computed from a BacktestResult.

Deliberately conservative: everything is derived from the realized trade list
and the equity curve, with no annualization magic beyond an explicit factor.
"""

from __future__ import annotations

import math
from typing import Dict, List

from .engine import BacktestResult


def total_return_pct(result: BacktestResult) -> float:
    start = result.config.initial_balance
    if start == 0:
        return 0.0
    return (result.final_balance - start) / start * 100.0


def max_drawdown_pct(result: BacktestResult) -> float:
    """Largest peak-to-trough decline of the equity curve, as a percentage."""
    peak = float("-inf")
    max_dd = 0.0
    for equity in result.equity_curve:
        peak = max(peak, equity)
        if peak > 0:
            dd = (peak - equity) / peak
            max_dd = max(max_dd, dd)
    return max_dd * 100.0


def win_rate_pct(result: BacktestResult) -> float:
    if not result.trades:
        return 0.0
    wins = sum(1 for t in result.trades if t.pnl > 0)
    return wins / len(result.trades) * 100.0


def profit_factor(result: BacktestResult) -> float:
    gross_profit = sum(t.pnl for t in result.trades if t.pnl > 0)
    gross_loss = -sum(t.pnl for t in result.trades if t.pnl < 0)
    if gross_loss == 0:
        return float("inf") if gross_profit > 0 else 0.0
    return gross_profit / gross_loss


def sharpe_ratio(result: BacktestResult, periods_per_year: int = 252 * 24) -> float:
    """Annualized Sharpe from bar-to-bar equity returns (risk-free = 0)."""
    curve = result.equity_curve
    if len(curve) < 3:
        return 0.0
    rets = []
    for a, b in zip(curve, curve[1:]):
        if a != 0:
            rets.append((b - a) / a)
    if len(rets) < 2:
        return 0.0
    mean = sum(rets) / len(rets)
    var = sum((r - mean) ** 2 for r in rets) / (len(rets) - 1)
    std = math.sqrt(var)
    if std == 0:
        return 0.0
    return (mean / std) * math.sqrt(periods_per_year)


def summary(result: BacktestResult) -> Dict[str, float]:
    trades = result.trades
    return {
        "trades": len(trades),
        "final_balance": round(result.final_balance, 2),
        "total_return_pct": round(total_return_pct(result), 2),
        "max_drawdown_pct": round(max_drawdown_pct(result), 2),
        "win_rate_pct": round(win_rate_pct(result), 2),
        "profit_factor": round(profit_factor(result), 3),
        "sharpe": round(sharpe_ratio(result), 3),
        "avg_trade_pnl": round(sum(t.pnl for t in trades) / len(trades), 2) if trades else 0.0,
    }


def format_summary(result: BacktestResult) -> str:
    s = summary(result)
    lines = [
        f"Strategy        : {result.strategy_name}",
        f"Trades          : {int(s['trades'])}",
        f"Final balance   : {s['final_balance']:,.2f}",
        f"Total return    : {s['total_return_pct']:+.2f}%",
        f"Max drawdown    : {s['max_drawdown_pct']:.2f}%",
        f"Win rate        : {s['win_rate_pct']:.2f}%",
        f"Profit factor   : {s['profit_factor']}",
        f"Sharpe (ann.)   : {s['sharpe']}",
        f"Avg trade P&L   : {s['avg_trade_pnl']:,.2f}",
    ]
    return "\n".join(lines)
