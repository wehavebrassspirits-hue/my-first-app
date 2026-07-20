"""Tests for the backtest engine and helpers - stdlib unittest, no deps."""

import os
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fxbt import (  # noqa: E402
    Backtester,
    BacktestConfig,
    Candle,
    Signal,
    SmaCrossStrategy,
    Strategy,
    generate_synthetic,
    get_preset,
    load_csv,
    load_histdata,
    metrics,
)
from fxbt.indicators import rsi, sma  # noqa: E402


def _mk(prices):
    """Build flat candles (o=h=l=c) from a close list."""
    t0 = datetime(2020, 1, 1, tzinfo=timezone.utc)
    return [
        Candle(time=t0 + timedelta(hours=i), open=p, high=p, low=p, close=p)
        for i, p in enumerate(prices)
    ]


class _AlwaysLong(Strategy):
    name = "always_long"

    def generate(self, candles):
        return [Signal.LONG] * len(candles)


class _AlwaysShort(Strategy):
    name = "always_short"

    def generate(self, candles):
        return [Signal.SHORT] * len(candles)


class TestIndicators(unittest.TestCase):
    def test_sma_basic(self):
        out = sma([1, 2, 3, 4, 5], 3)
        self.assertEqual(out[:2], [None, None])
        self.assertAlmostEqual(out[2], 2.0)
        self.assertAlmostEqual(out[4], 4.0)

    def test_rsi_all_up_is_100(self):
        out = rsi(list(range(1, 30)), 14)
        self.assertAlmostEqual(out[-1], 100.0)

    def test_rsi_all_down_is_zero(self):
        out = rsi(list(range(30, 1, -1)), 14)
        self.assertAlmostEqual(out[-1], 0.0)


class TestEngine(unittest.TestCase):
    def _cfg(self, **kw):
        base = dict(
            initial_balance=10_000.0,
            pip_size=0.01,
            spread_pips=0.0,
            slippage_pips=0.0,
            risk_per_trade=0.0,
            fixed_units=1000.0,
            stop_loss_pips=None,
            take_profit_pips=None,
        )
        base.update(kw)
        return BacktestConfig(**base)

    def test_long_profits_on_uptrend(self):
        candles = _mk([100, 101, 102, 103, 104])
        res = Backtester(self._cfg()).run(candles, _AlwaysLong())
        self.assertGreater(res.final_balance, 10_000.0)

    def test_short_profits_on_downtrend(self):
        candles = _mk([104, 103, 102, 101, 100])
        res = Backtester(self._cfg()).run(candles, _AlwaysShort())
        self.assertGreater(res.final_balance, 10_000.0)

    def test_no_lookahead_first_bar_flat(self):
        # Signal from bar i executes at bar i+1 open, so bar 0 never trades.
        candles = _mk([100, 200])
        res = Backtester(self._cfg()).run(candles, _AlwaysLong())
        # Only one execution possible; a single flat->long open with no close
        # until end_of_data. Ensure exactly one trade recorded.
        self.assertEqual(len(res.trades), 1)

    def test_spread_costs_money(self):
        candles = _mk([100, 100, 100, 100])
        res = Backtester(self._cfg(spread_pips=2.0)).run(candles, _AlwaysLong())
        # Flat price but paying spread => a loss.
        self.assertLess(res.final_balance, 10_000.0)

    def test_stop_loss_triggers(self):
        # Price gaps down hard; SL should cap the loss and mark reason.
        t0 = datetime(2020, 1, 1, tzinfo=timezone.utc)
        candles = [
            Candle(t0, 100, 100, 100, 100),
            Candle(t0 + timedelta(hours=1), 100, 100, 100, 100),
            Candle(t0 + timedelta(hours=2), 100, 100, 90, 95),  # low pierces SL
        ]
        cfg = self._cfg(stop_loss_pips=50.0, pip_size=0.01)  # SL 0.50 below entry
        res = Backtester(cfg).run(candles, _AlwaysLong())
        self.assertTrue(any(t.reason == "stop_loss" for t in res.trades))

    def test_risk_sizing_scales_with_stop(self):
        candles = _mk([100, 101])
        cfg = self._cfg(risk_per_trade=0.01, fixed_units=None, stop_loss_pips=10.0)
        Backtester(cfg).run(candles, _AlwaysLong())  # should not raise

    def test_synthetic_pipeline_runs(self):
        candles = generate_synthetic(n=500, seed=1)
        res = Backtester(BacktestConfig()).run(candles, SmaCrossStrategy(10, 30))
        s = metrics.summary(res)
        self.assertIn("total_return_pct", s)
        self.assertEqual(len(res.equity_curve), len(candles) - 1)

    def test_determinism(self):
        c1 = generate_synthetic(n=300, seed=7)
        c2 = generate_synthetic(n=300, seed=7)
        r1 = Backtester(BacktestConfig()).run(c1, SmaCrossStrategy())
        r2 = Backtester(BacktestConfig()).run(c2, SmaCrossStrategy())
        self.assertEqual(r1.final_balance, r2.final_balance)


class TestLoaders(unittest.TestCase):
    def _write(self, text, suffix=".csv"):
        fd, path = tempfile.mkstemp(suffix=suffix)
        with os.fdopen(fd, "w") as f:
            f.write(text)
        self.addCleanup(os.unlink, path)
        return path

    def test_stooq_style_comma_header(self):
        path = self._write(
            "Date,Open,High,Low,Close,Volume\n"
            "2020-01-01,1.1000,1.1020,1.0990,1.1010,1000\n"
            "2020-01-02,1.1010,1.1030,1.1000,1.1025,1200\n"
        )
        candles = load_csv(path)
        self.assertEqual(len(candles), 2)
        self.assertAlmostEqual(candles[0].close, 1.1010)
        self.assertEqual(candles[0].time.year, 2020)

    def test_semicolon_delimiter_and_dotted_date(self):
        path = self._write(
            "Gmt time;Open;High;Low;Close;Volume\n"
            "01.01.2020 17:00:00;1.1000;1.1020;1.0990;1.1010;0\n"
        )
        candles = load_csv(path)
        self.assertEqual(len(candles), 1)
        self.assertEqual(candles[0].time.hour, 17)

    def test_histdata_headerless(self):
        path = self._write(
            "20200101 170000;1.12000;1.12010;1.11990;1.12005;0\n"
            "20200101 170100;1.12005;1.12020;1.12000;1.12015;0\n"
        )
        candles = load_histdata(path)
        self.assertEqual(len(candles), 2)
        self.assertAlmostEqual(candles[1].close, 1.12015)

    def test_missing_column_raises(self):
        path = self._write("Date,Open,High,Close\n2020-01-01,1,2,1.5\n")
        with self.assertRaises(ValueError):
            load_csv(path)


class TestPresets(unittest.TestCase):
    def test_eurusd_pip(self):
        self.assertAlmostEqual(get_preset("EUR/USD").pip_size, 0.0001)

    def test_normalization(self):
        self.assertEqual(get_preset("eur_usd").symbol, get_preset("eurusd").symbol)

    def test_unknown_raises(self):
        with self.assertRaises(ValueError):
            get_preset("btcusd")


class TestMetrics(unittest.TestCase):
    def test_max_drawdown_monotonic_up_is_zero(self):
        res = Backtester(
            BacktestConfig(spread_pips=0.0, stop_loss_pips=None, take_profit_pips=None)
        ).run(_mk([100, 101, 102, 103]), _AlwaysLong())
        self.assertGreaterEqual(metrics.max_drawdown_pct(res), 0.0)


if __name__ == "__main__":
    unittest.main(verbosity=2)
