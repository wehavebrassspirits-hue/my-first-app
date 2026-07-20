"""Price data: an OHLC candle type, a CSV loader, and a synthetic generator.

The synthetic generator lets the whole pipeline run with zero external data,
which is the safest starting point before wiring up a real broker/data feed.
"""

from __future__ import annotations

import csv
import math
import random
from dataclasses import dataclass
from datetime import datetime, timedelta, timezone
from typing import List, Optional


@dataclass(frozen=True)
class Candle:
    """A single OHLC bar. `time` is timezone-aware UTC."""

    time: datetime
    open: float
    high: float
    low: float
    close: float
    volume: float = 0.0


def generate_synthetic(
    n: int = 2000,
    start_price: float = 150.0,
    *,
    seed: Optional[int] = 42,
    annual_drift: float = 0.0,
    annual_vol: float = 0.10,
    bars_per_year: int = 252 * 24,
    timeframe_minutes: int = 60,
    start_time: Optional[datetime] = None,
) -> List[Candle]:
    """Generate a geometric-Brownian-motion price series as OHLC candles.

    This is *not* real market data - it only exists so the engine and metrics
    can be exercised end-to-end offline. Defaults resemble a USD/JPY-ish level.
    """
    rng = random.Random(seed)
    dt = 1.0 / bars_per_year
    mu = annual_drift
    sigma = annual_vol

    if start_time is None:
        start_time = datetime(2020, 1, 1, tzinfo=timezone.utc)

    candles: List[Candle] = []
    price = start_price
    for i in range(n):
        # GBM step for the close-to-close move.
        z = rng.gauss(0.0, 1.0)
        ret = (mu - 0.5 * sigma * sigma) * dt + sigma * math.sqrt(dt) * z
        new_price = price * math.exp(ret)

        o = price
        c = new_price
        # Intrabar wiggle proportional to the step size.
        wiggle = abs(c - o) + price * sigma * math.sqrt(dt) * 0.5
        hi = max(o, c) + abs(rng.gauss(0.0, 1.0)) * wiggle * 0.5
        lo = min(o, c) - abs(rng.gauss(0.0, 1.0)) * wiggle * 0.5
        vol = round(abs(rng.gauss(1000, 300)), 2)

        candles.append(
            Candle(
                time=start_time + timedelta(minutes=timeframe_minutes * i),
                open=round(o, 5),
                high=round(hi, 5),
                low=round(lo, 5),
                close=round(c, 5),
                volume=vol,
            )
        )
        price = new_price

    return candles


def load_csv(
    path: str,
    *,
    time_col: str = "time",
    open_col: str = "open",
    high_col: str = "high",
    low_col: str = "low",
    close_col: str = "close",
    volume_col: Optional[str] = "volume",
    time_format: Optional[str] = None,
) -> List[Candle]:
    """Load OHLC candles from a CSV file with a header row.

    `time_format` is a strptime format; if omitted, ISO-8601 is assumed.
    Unix epoch timestamps (all-digit values) are also accepted.
    """
    candles: List[Candle] = []
    with open(path, newline="") as f:
        reader = csv.DictReader(f)
        for row in reader:
            raw_time = row[time_col].strip()
            candles.append(
                Candle(
                    time=_parse_time(raw_time, time_format),
                    open=float(row[open_col]),
                    high=float(row[high_col]),
                    low=float(row[low_col]),
                    close=float(row[close_col]),
                    volume=float(row[volume_col]) if volume_col and row.get(volume_col) else 0.0,
                )
            )
    candles.sort(key=lambda c: c.time)
    return candles


def _parse_time(raw: str, time_format: Optional[str]) -> datetime:
    if time_format:
        dt = datetime.strptime(raw, time_format)
    elif raw.isdigit():
        # Treat as unix seconds (or milliseconds for 13-digit values).
        ts = int(raw)
        if ts > 10_000_000_000:
            ts /= 1000.0
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    else:
        dt = datetime.fromisoformat(raw.replace("Z", "+00:00"))
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt
