# Binance MCP サーバー

[English](../README.md) | [中文](README_zh.md) | [日本語](README_ja.md)

MCP 対応 AI クライアント向けの Binance **現物取引**サーバーです。stdio を使用し、10 個のツールを提供します。Node.js **24+** が必要です。先物、出金、ストリーミング購読は提供しません。

**2.0.0 は未公開です。** 公開までは以下のソースからの手順を使用してください。[移行ガイド](../CHANGELOG.md)も参照してください。

## ソースからセットアップ

```bash
git clone https://github.com/ethancod1ng/binance-mcp-server.git
cd binance-mcp-server
npm ci
npm run build
cp .env.example .env
```

`.env.example` を `.env` にコピーし、選択したネットワークのキーを設定してください。現在は市場データのみでも起動時に API Key と Secret が必要です。`.env` は作業ディレクトリから読み込みます。MCP クライアントの `env` 設定を推奨します。

## MCP クライアント設定

絶対パスをビルド済みリポジトリのパスに置き換えてください。クライアントがプロセスを起動し、stdin/stdout に接続します。HTTP サーバーではありません。以下は照会専用の設定です。

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": [
        "/absolute/path/to/binance-mcp-server/dist/index.js"
      ],
      "env": {
        "BINANCE_API_KEY": "your_testnet_api_key",
        "BINANCE_API_SECRET": "your_testnet_api_secret",
        "BINANCE_TESTNET": "true",
        "BINANCE_ENABLE_TRADING": "false",
        "BINANCE_ALLOW_MAINNET_TRADING": "false"
      }
    }
  }
}
```

2.0.0 公開後は、クライアントを `command: "npx"`、`args: ["-y", "binance-mcp-server@2.0.0"]` に変更できます。環境変数は同じです。バージョンは package.json から取得し、`MCP_SERVER_VERSION` は使用しません。

## 取引スイッチと移行

`BINANCE_TESTNET` を省略するとテストネットになります。真偽値は文字列 `true` と `false` のみ受け付け、それ以外は起動エラーになります。1.x から更新する場合は既存設定を確認してください。

テストネットでの**発注と取消**には `BINANCE_ENABLE_TRADING=true` が必要です。メインネットでは、さらに `BINANCE_TESTNET=false` と `BINANCE_ALLOW_MAINNET_TRADING=true`、メインネット用キーが必要です。これらは設定上の許可であり、注文ごとの確認ではありません。確認画面の有無はクライアントに依存します。必要な API 権限だけを付与してください。出金権限は不要です。

## ツール一覧

| ツール | 入力と動作 |
|---|---|
| `get_price` | `symbol` 必須。 |
| `get_orderbook` | `symbol` 必須。`limit` は既定 100。5、10、20、50、100、500、1000、5000 が使用可能。 |
| `get_klines` | `symbol`、`interval` 必須。`limit` は 1–1000、既定 500。開始・終了時刻は指定不可。 |
| `get_24hr_ticker` | `symbol` は任意。省略時は全銘柄。 |
| `get_account_info` | 入力不要。ゼロ以外の残高を返し、合計は十進数で計算。 |
| `get_open_orders` | `symbol` は任意。省略時は全未約定注文。 |
| `get_order_history` | `symbol` 必須。`limit` は 1–1000、既定 500。時刻や注文 ID によるページングは未提供。 |
| `place_order` | `symbol`、`side` BUY/SELL、`type` MARKET/LIMIT、`quantity` 必須。数量は基軸資産の十進数字列。LIMIT は `price` 必須、GTC 固定。 |
| `cancel_order` | `symbol`、正の安全な整数 `orderId` 必須。 |
| `cancel_all_orders` | `symbol` 必須。**指定銘柄のみ**の全未約定注文を取消。 |

銘柄は大文字英数字です（例: `1INCHUSDT`）。価格と数量は正の十進数字列にしてください。銘柄、価格刻み、数量刻み、最低取引額は Binance 側でも検証されます。K 線間隔: `1m`、`3m`、`5m`、`15m`、`30m`、`1h`、`2h`、`4h`、`6h`、`8h`、`12h`、`1d`、`3d`、`1w`、`1M`。

結果は MCP テキスト内の JSON です。ツール実行エラーは `isError: true` を返します。サーバーが追加するタイムスタンプはローカル時刻のミリ秒で、Binance 由来の値は元の意味を保持します。

## 使用例（取引には事前の有効化が必要）

```json
{"name":"get_price","arguments":{"symbol":"BTCUSDT"}}
{"name":"get_klines","arguments":{"symbol":"ETHUSDT","interval":"1h","limit":24}}
{"name":"place_order","arguments":{"symbol":"BTCUSDT","side":"BUY","type":"LIMIT","quantity":"0.001","price":"50000"}}
```

## 開発とパッケージ

```bash
npm run check
npm audit --omit=dev
npm pack --dry-run
docker build -t binance-mcp-server .
docker run --rm -i --env-file .env binance-mcp-server
```

起動できない場合は Node バージョン、キー、真偽値を確認してください。取引無効エラーは上記スイッチを確認し、署名・時刻エラーはネットワークとキーの組み合わせ、システム時計を確認してください。Issue にキーを記載しないでください。

[Tutorial](https://github.com/ethancod1ng/binance-mcp-server/blob/main/docs/mcp-usage-tutorial.gif) · [Changelog](../CHANGELOG.md) · [MIT License](../LICENSE)
