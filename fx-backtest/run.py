#!/usr/bin/env python3
"""CLI entry point for running a backtest.

Examples:
    # Run the built-in SMA-cross strategy on synthetic data (no data needed):
    python run.py --strategy sma --fast 20 --slow 50

    # Run RSI mean-reversion on your own CSV:
    python run.py --strategy rsi --csv data/usdjpy_h1.csv --pip-size 0.01
"""

from __future__ import annotations

import argparse
import sys

from fxbt import (
    Backtester,
    BacktestConfig,
    RsiStrategy,
    SmaCrossStrategy,
    generate_synthetic,
    get_preset,
    load_csv,
    load_histdata,
    metrics,
)


def build_strategy(args):
    if args.strategy == "sma":
        return SmaCrossStrategy(fast=args.fast, slow=args.slow, allow_short=not args.long_only)
    if args.strategy == "rsi":
        return RsiStrategy(
            period=args.rsi_period,
            oversold=args.oversold,
            overbought=args.overbought,
            allow_short=not args.long_only,
        )
    raise ValueError(f"unknown strategy: {args.strategy}")


def main(argv=None):
    p = argparse.ArgumentParser(description="fxbt - FX strategy backtester")
    p.add_argument("--strategy", choices=["sma", "rsi"], default="sma")
    p.add_argument(
        "--preset",
        default="eurusd",
        help="instrument preset: eurusd | usdjpy | xauusd (sets pip size & spread)",
    )
    p.add_argument("--csv", help="OHLC CSV file (auto-detects common formats)")
    p.add_argument("--histdata", help="HistData.com headerless 1-min file")
    p.add_argument("--bars", type=int, default=3000, help="synthetic bar count")
    p.add_argument("--seed", type=int, default=42, help="synthetic RNG seed")

    # Strategy params
    p.add_argument("--fast", type=int, default=20)
    p.add_argument("--slow", type=int, default=50)
    p.add_argument("--rsi-period", type=int, default=14)
    p.add_argument("--oversold", type=float, default=30.0)
    p.add_argument("--overbought", type=float, default=70.0)
    p.add_argument("--long-only", action="store_true")

    # Account / cost params
    p.add_argument("--balance", type=float, default=10_000.0)
    p.add_argument("--pip-size", type=float, default=None, help="override preset pip size")
    p.add_argument("--spread-pips", type=float, default=None, help="override preset spread")
    p.add_argument("--slippage-pips", type=float, default=0.0)
    p.add_argument("--risk", type=float, default=0.01, help="fraction of equity risked per trade")
    p.add_argument("--sl-pips", type=float, default=30.0)
    p.add_argument("--tp-pips", type=float, default=60.0)

    args = p.parse_args(argv)

    preset = get_preset(args.preset)
    pip_size = args.pip_size if args.pip_size is not None else preset.pip_size
    spread_pips = args.spread_pips if args.spread_pips is not None else preset.typical_spread_pips

    if args.histdata:
        candles = load_histdata(args.histdata)
        source = f"{args.histdata} (HistData)"
    elif args.csv:
        candles = load_csv(args.csv)
        source = args.csv
    else:
        candles = generate_synthetic(
            n=args.bars,
            seed=args.seed,
            start_price=preset.synth_start_price,
            annual_vol=preset.synth_annual_vol,
        )
        source = f"SYNTHETIC ({args.bars} bars, seed={args.seed}) — not real market data"

    config = BacktestConfig(
        initial_balance=args.balance,
        pip_size=pip_size,
        spread_pips=spread_pips,
        slippage_pips=args.slippage_pips,
        risk_per_trade=args.risk,
        stop_loss_pips=args.sl_pips,
        take_profit_pips=args.tp_pips,
    )

    strategy = build_strategy(args)
    result = Backtester(config).run(candles, strategy)

    print(f"Instrument      : {preset.symbol}  (pip={pip_size}, spread={spread_pips} pips)")
    print(f"Data source     : {source}")
    print(f"Bars            : {len(candles)}")
    print("-" * 40)
    print(metrics.format_summary(result))
    print("-" * 40)
    print("Note: past performance does not guarantee future results.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
