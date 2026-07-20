"""Per-instrument presets: pip size, typical spread, and synthetic-data hints.

Spreads are rough retail-typical values for a major broker; adjust to match the
broker you actually use, since spread is the single biggest cost in a backtest.
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Dict


@dataclass(frozen=True)
class InstrumentPreset:
    symbol: str
    pip_size: float
    typical_spread_pips: float
    # Hints only used when generating synthetic data (no real data supplied).
    synth_start_price: float
    synth_annual_vol: float


PRESETS: Dict[str, InstrumentPreset] = {
    "eurusd": InstrumentPreset(
        symbol="EUR/USD",
        pip_size=0.0001,
        typical_spread_pips=0.6,
        synth_start_price=1.10,
        synth_annual_vol=0.08,
    ),
    "usdjpy": InstrumentPreset(
        symbol="USD/JPY",
        pip_size=0.01,
        typical_spread_pips=0.9,
        synth_start_price=150.0,
        synth_annual_vol=0.09,
    ),
    "xauusd": InstrumentPreset(
        symbol="XAU/USD (Gold)",
        pip_size=0.1,
        typical_spread_pips=20.0,  # gold spreads are wide and volatile
        synth_start_price=2000.0,
        synth_annual_vol=0.16,
    ),
}


def get_preset(name: str) -> InstrumentPreset:
    key = name.lower().replace("/", "").replace("_", "").replace("-", "")
    if key not in PRESETS:
        raise ValueError(f"unknown preset '{name}'; known: {', '.join(PRESETS)}")
    return PRESETS[key]
