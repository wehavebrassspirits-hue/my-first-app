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


# Column-name aliases seen across the common free EUR/USD data sources
# (Stooq, Dukascopy, MetaTrader exports, Yahoo Finance, generic CSVs).
_TIME_ALIASES = ("time", "date", "datetime", "timestamp", "gmt time", "<date>", "local time")
_OPEN_ALIASES = ("open", "<open>", "o")
_HIGH_ALIASES = ("high", "<high>", "h")
_LOW_ALIASES = ("low", "<low>", "l")
_CLOSE_ALIASES = ("close", "<close>", "c", "adj close", "price")
_VOLUME_ALIASES = ("volume", "<vol>", "vol", "v")


def load_csv(
    path: str,
    *,
    time_col: Optional[str] = None,
    open_col: Optional[str] = None,
    high_col: Optional[str] = None,
    low_col: Optional[str] = None,
    close_col: Optional[str] = None,
    volume_col: Optional[str] = None,
    time_format: Optional[str] = None,
) -> List[Candle]:
    """Load OHLC candles from a CSV with a header row.

    Column names are matched case-insensitively against the common aliases used
    by Stooq, Dukascopy, MetaTrader, and Yahoo Finance exports, so most free
    EUR/USD downloads load without any extra arguments. The delimiter (`,`, `;`,
    or tab) is auto-detected. Pass explicit `*_col` names to override matching.

    `time_format` is a strptime format; if omitted, ISO-8601, `YYYYMMDD HHMMSS`,
    `YYYY-MM-DD HH:MM:SS`, and unix epoch values are auto-detected.
    """
    with open(path, newline="") as f:
        sample = f.read(4096)
        f.seek(0)
        delimiter = _sniff_delimiter(sample)
        reader = csv.DictReader(f, delimiter=delimiter)
        if reader.fieldnames is None:
            raise ValueError(f"{path}: no header row found")

        header = {name.strip().lower(): name for name in reader.fieldnames}
        tcol = time_col or _match(header, _TIME_ALIASES, "time", path)
        ocol = open_col or _match(header, _OPEN_ALIASES, "open", path)
        hcol = high_col or _match(header, _HIGH_ALIASES, "high", path)
        lcol = low_col or _match(header, _LOW_ALIASES, "low", path)
        ccol = close_col or _match(header, _CLOSE_ALIASES, "close", path)
        vcol = volume_col or _match(header, _VOLUME_ALIASES, "volume", path, required=False)

        candles: List[Candle] = []
        for row in reader:
            raw_time = (row[tcol] or "").strip()
            if not raw_time:
                continue
            candles.append(
                Candle(
                    time=_parse_time(raw_time, time_format),
                    open=float(row[ocol]),
                    high=float(row[hcol]),
                    low=float(row[lcol]),
                    close=float(row[ccol]),
                    volume=float(row[vcol]) if vcol and row.get(vcol) else 0.0,
                )
            )
    candles.sort(key=lambda c: c.time)
    return candles


def load_histdata(path: str) -> List[Candle]:
    """Load HistData.com's headerless 1-minute format (a popular free source).

    Rows look like: ``20200101 170000;1.12000;1.12010;1.11990;1.12005;0``
    (semicolon-separated, `YYYYMMDD HHMMSS` GMT timestamp, no volume for FX).
    """
    candles: List[Candle] = []
    with open(path, newline="") as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            parts = line.split(";")
            if len(parts) < 5:
                continue
            candles.append(
                Candle(
                    time=_parse_time(parts[0].strip(), "%Y%m%d %H%M%S"),
                    open=float(parts[1]),
                    high=float(parts[2]),
                    low=float(parts[3]),
                    close=float(parts[4]),
                    volume=float(parts[5]) if len(parts) > 5 and parts[5] else 0.0,
                )
            )
    candles.sort(key=lambda c: c.time)
    return candles


def _sniff_delimiter(sample: str) -> str:
    try:
        return csv.Sniffer().sniff(sample, delimiters=",;\t").delimiter
    except csv.Error:
        return ","


def _match(header, aliases, label, path, required=True):
    for alias in aliases:
        if alias in header:
            return header[alias]
    if required:
        raise ValueError(
            f"{path}: could not find a '{label}' column "
            f"(looked for {aliases}; header has {list(header.values())})"
        )
    return None


def _parse_time(raw: str, time_format: Optional[str]) -> datetime:
    if time_format:
        dt = datetime.strptime(raw, time_format)
    elif raw.isdigit() and len(raw) not in (8,):
        # Treat as unix seconds (or milliseconds for 13-digit values).
        # (An 8-digit all-digit value is a YYYYMMDD date, handled below.)
        ts = int(raw)
        if ts > 10_000_000_000:
            ts /= 1000.0
        dt = datetime.fromtimestamp(ts, tz=timezone.utc)
    else:
        dt = _parse_datetime_flexible(raw)
    if dt.tzinfo is None:
        dt = dt.replace(tzinfo=timezone.utc)
    return dt


# Common non-ISO layouts in free FX exports, tried in order.
_TIME_FORMATS = (
    "%Y%m%d %H%M%S",       # HistData: 20200101 170000
    "%Y%m%d",              # 20200101
    "%Y-%m-%d %H:%M:%S",   # 2020-01-01 17:00:00
    "%Y.%m.%d %H:%M:%S",   # MetaTrader: 2020.01.01 17:00:00
    "%Y.%m.%d %H:%M",      # MetaTrader minute
    "%d.%m.%Y %H:%M:%S",   # Dukascopy: 01.01.2020 17:00:00.000 (fractional stripped)
    "%m/%d/%Y %H:%M:%S",
    "%m/%d/%Y",
)


def _parse_datetime_flexible(raw: str) -> datetime:
    try:
        return datetime.fromisoformat(raw.replace("Z", "+00:00"))
    except ValueError:
        pass
    # Drop fractional seconds / trailing GMT offset text some sources append.
    cleaned = raw.split(".")[0] if raw.count(".") == 1 and ":" in raw else raw
    cleaned = cleaned.split(" GMT")[0].strip()
    for fmt in _TIME_FORMATS:
        try:
            return datetime.strptime(cleaned, fmt)
        except ValueError:
            continue
    raise ValueError(f"could not parse timestamp: {raw!r}")
