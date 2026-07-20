"""fxbt - a small, dependency-free FX backtesting foundation.

Pure standard library so it runs on any Python 3.9+ without installing anything.
Designed to be extended later (numpy/pandas, live broker adapters, more strategies).
"""

from .data import Candle, generate_synthetic, load_csv
from .strategy import Signal, Strategy, SmaCrossStrategy, RsiStrategy
from .engine import Backtester, BacktestConfig, Trade, BacktestResult
from . import metrics

__all__ = [
    "Candle",
    "generate_synthetic",
    "load_csv",
    "Signal",
    "Strategy",
    "SmaCrossStrategy",
    "RsiStrategy",
    "Backtester",
    "BacktestConfig",
    "Trade",
    "BacktestResult",
    "metrics",
]
