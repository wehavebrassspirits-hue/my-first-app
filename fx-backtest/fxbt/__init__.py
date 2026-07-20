"""fxbt - a small, dependency-free FX backtesting foundation.

Pure standard library so it runs on any Python 3.9+ without installing anything.
Designed to be extended later (numpy/pandas, live broker adapters, more strategies).
"""

from .data import Candle, generate_synthetic, load_csv, load_histdata
from .strategy import Signal, Strategy, SmaCrossStrategy, RsiStrategy
from .engine import Backtester, BacktestConfig, Trade, BacktestResult
from .presets import PRESETS, InstrumentPreset, get_preset
from . import metrics

__all__ = [
    "Candle",
    "generate_synthetic",
    "load_csv",
    "load_histdata",
    "PRESETS",
    "InstrumentPreset",
    "get_preset",
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
