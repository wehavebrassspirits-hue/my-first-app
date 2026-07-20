# fxbt — FX 自動売買システムのバックテスト基盤

FX（為替）戦略を **過去データで検証（バックテスト）** するための、依存パッケージ不要（Python 標準ライブラリのみ）の基盤です。
自動売買システムを作る際に、いきなり実弾を入れずにまず「その戦略は過去に通用したか」を確かめる、一番安全な出発点になります。

> ⚠️ **重要**: これは戦略の検証ツールです。「必ず勝てるロジック」は誰にも作れません。
> 過去に勝てた戦略が将来も勝つ保証はゼロで、手数料・スプレッド・スリッページを含めると多くの戦略はマイナスになります。
> 本ツールはまさにそれを数値で可視化するためのものです。

## 特長

- **依存ゼロ / 即動く** — `pip install` 不要。`python run.py` だけで合成データを生成して検証できる
- **現実的なコスト** — スプレッド・スリッページを毎回の約定に課金
- **リスクベースのロット計算** — 資金に対するリスク割合と損切り幅から自動でサイズ決定
- **損切り / 利確** — バー内の高値・安値で SL/TP を判定
- **先読みバイアス排除** — バー `i` のシグナルはバー `i+1` の始値で執行
- **主要指標** — 総リターン / 最大ドローダウン / 勝率 / プロフィットファクター / シャープレシオ

## クイックスタート

```bash
cd fx-backtest

# 合成データで SMA クロス戦略を検証（データ不要）
python run.py --strategy sma --fast 20 --slow 50

# RSI 逆張り戦略、ロングのみ
python run.py --strategy rsi --long-only

# 自分の CSV で検証（EUR/USD なら pip は 0.0001）
python run.py --strategy rsi --csv data/sample_eurusd_h1.csv --pip-size 0.0001
```

### CSV フォーマット

ヘッダー付きの OHLC。`time` は ISO-8601 か Unix エポック秒。

```csv
time,open,high,low,close,volume
2020-01-01T00:00:00+00:00,1.10,1.101,1.099,1.1005,1000
```

## 主なオプション

| オプション | 意味 | 既定値 |
|---|---|---|
| `--strategy` | `sma` または `rsi` | `sma` |
| `--csv` | 入力 CSV（省略時は合成データ） | なし |
| `--pip-size` | 1 pip の値（JPY 系 `0.01` / その他 `0.0001`） | `0.01` |
| `--spread-pips` | スプレッド（pips、往復） | `0.8` |
| `--slippage-pips` | スリッページ（pips） | `0.0` |
| `--risk` | 1 トレードで許容する資金リスク割合 | `0.01` |
| `--sl-pips` / `--tp-pips` | 損切り / 利確幅（pips） | `30` / `60` |
| `--balance` | 初期資金 | `10000` |

## 構成

```
fx-backtest/
├── run.py              # CLI エントリポイント
├── fxbt/
│   ├── data.py         # Candle 型・CSV 読み込み・合成データ生成
│   ├── indicators.py   # SMA / EMA / RSI
│   ├── strategy.py     # Strategy 基底クラス・SMA クロス・RSI 戦略
│   ├── engine.py       # バックテストエンジン（コスト・サイズ・SL/TP）
│   └── metrics.py      # パフォーマンス指標
├── data/               # サンプル CSV
└── tests/              # unittest（依存なし）
```

## 独自戦略の追加

`Strategy` を継承し、各バーの `Signal`（`LONG` / `SHORT` / `FLAT`）を返すだけです。
戦略は `candles[:i+1]` しか参照できず、執行・コスト・サイズはエンジン側が担当します。

```python
from fxbt import Strategy, Signal
from fxbt.indicators import ema

class EmaTrend(Strategy):
    name = "ema_trend"
    def warmup(self): return 100
    def generate(self, candles):
        closes = [c.close for c in candles]
        fast, slow = ema(closes, 20), ema(closes, 100)
        out = []
        for f, s in zip(fast, slow):
            if f is None or s is None: out.append(Signal.FLAT)
            else: out.append(Signal.LONG if f > s else Signal.SHORT)
        return out
```

## テスト

```bash
python -m unittest discover -s tests -v
```

## モデルの簡略化（今後厳密化できる点）

- 口座通貨＝クオート通貨と仮定（損益 = 数量 × 値幅）
- 同時保有は 1 ポジションのみ（ドテンは旧ポジを決済して新規建て）
- 同一バー内で SL と TP の両方に触れた場合は SL 優先（保守的）
- スワップ（金利）・約定拒否・部分約定は未モデル化

## 自動売買システム全体のロードマップ

このバックテスト基盤は 5 段階のうちの Step 3 です。

1. データ取得（無料 API / 過去データ CSV）
2. 戦略ロジックのコード化 ← `fxbt/strategy.py`
3. **バックテストで検証 ← いまここ**
4. ペーパートレード（デモ口座で仮想売買）
5. 少額の実口座で運用

Step 4 以降（OANDA など実ブローカー API との接続、リアルタイム発注、ポジション監視）は、
どのブローカーを使うか決まった段階で `fxbt` の上に発注アダプタを載せる形で拡張できます。
