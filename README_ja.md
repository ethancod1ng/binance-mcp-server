# Binance MCP サーバー

Claude Code に Binance 取引所 API 機能へのシームレスなアクセスを提供する包括的なモデルコンテキストプロトコル（MCP）サーバーです。

## 機能

- **マーケットデータツール**：リアルタイム価格、注文板の深度、K線データ、24時間統計の取得
- **アカウント管理**：アカウント情報、残高、未約定注文、注文履歴の表示
- **取引操作**：注文、キャンセル（テストネットのみ）
- **完全な TypeScript サポート**：完全な型定義と検証
- **セキュリティ重視**：環境変数ベースの設定と入力検証
- **エラーハンドリング**：包括的なエラーハンドリングとセキュアなログ記録

## クイックスタート

### インストール

```bash
npm install
```

### 設定

1. 環境変数テンプレートをコピー：
```bash
cp .env.example .env
```

2. `.env` ファイルで Binance API 認証情報を設定：
```env
BINANCE_API_KEY=あなたのAPIキー
BINANCE_API_SECRET=あなたのAPIシークレット
BINANCE_TESTNET=true
MCP_SERVER_NAME=binance-mcp-server
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

### サーバーの実行

開発モード：
```bash
npm run dev
```

本番ビルド：
```bash
npm run build
npm start
```

## 利用可能なツール

### マーケットデータツール

#### get_price
取引ペアの現在価格を取得。
```json
{
  "symbol": "BTCUSDT"
}
```

#### get_orderbook
注文板の深度データを取得。
```json
{
  "symbol": "BTCUSDT",
  "limit": 100
}
```

#### get_klines
K線/ローソク足データを取得。
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 500
}
```

#### get_24hr_ticker
24時間価格変動統計を取得。
```json
{
  "symbol": "BTCUSDT"
}
```

### アカウントツール

#### get_account_info
アカウント情報と残高を取得。
```json
{}
```

#### get_open_orders
現在の未約定注文を取得。
```json
{
  "symbol": "BTCUSDT"
}
```

#### get_order_history
注文履歴を取得。
```json
{
  "symbol": "BTCUSDT",
  "limit": 500
}
```

### 取引ツール（テストネットのみ）

#### place_order
新しい注文を発注。
```json
{
  "symbol": "BTCUSDT",
  "side": "BUY",
  "type": "LIMIT",
  "quantity": "0.001",
  "price": "50000"
}
```

#### cancel_order
特定の注文をキャンセル。
```json
{
  "symbol": "BTCUSDT",
  "orderId": 12345
}
```

#### cancel_all_orders
シンボルのすべての未約定注文をキャンセル。
```json
{
  "symbol": "BTCUSDT"
}
```

## Claude Code 統合

### 設定

Claude Code MCP 設定に以下を追加：

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": ["/path/to/binance-mcp-server/dist/index.js"],
      "env": {
        "BINANCE_API_KEY": "あなたのAPIキー",
        "BINANCE_API_SECRET": "あなたのAPIシークレット",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

### 使用例

Claude に質問：
- "ビットコインの現在価格を取得して"
- "アカウント残高を表示して"
- "ETHUSDT の注文板を取得して"
- "未約定注文を確認して"
- "50000ドルで0.001BTCの指値買い注文を出して"

## セキュリティ

### 重要なセキュリティ注意事項

1. **API キー**：API キーをバージョン管理にコミットしないでください
2. **テストネットのみ**：取引機能は `BINANCE_TESTNET=true` の場合のみ動作します
3. **入力検証**：すべての入力は Zod スキーマで検証されます
4. **エラーのサニタイズ**：機密情報はエラーログから削除されます

### 環境変数

| 変数 | 必須 | 説明 |
|------|------|------|
| `BINANCE_API_KEY` | はい | あなたの Binance API キー |
| `BINANCE_API_SECRET` | はい | あなたの Binance API シークレット |
| `BINANCE_TESTNET` | いいえ | テストネットモードを有効化（デフォルト：false） |
| `MCP_SERVER_NAME` | いいえ | サーバー名（デフォルト：binance-mcp-server） |
| `MCP_SERVER_VERSION` | いいえ | サーバーバージョン（デフォルト：1.0.0） |
| `LOG_LEVEL` | いいえ | ログレベル（デフォルト：info） |

## 開発

### プロジェクト構造

```
binance-mcp-server/
├── src/
│   ├── index.ts              # サーバーエントリーポイント
│   ├── server.ts             # MCP サーバーコア
│   ├── tools/                # ツールモジュール
│   │   ├── market-data.ts    # マーケットデータツール
│   │   ├── account.ts        # アカウント情報ツール
│   │   ├── trading.ts        # 取引ツール
│   │   └── index.ts          # ツールエクスポート
│   ├── types/                # TypeScript 定義
│   │   ├── binance.ts        # Binance API 型
│   │   └── mcp.ts            # MCP 入力スキーマ
│   ├── config/
│   │   └── binance.ts        # 設定管理
│   └── utils/
│       ├── validation.ts     # 入力検証
│       └── error-handling.ts # エラーハンドリング
├── dist/                     # コンパイル済み JavaScript
├── .env.example              # 環境変数テンプレート
├── package.json
├── tsconfig.json
└── README.md
```

### スクリプト

- `npm run build` - TypeScript を JavaScript にコンパイル
- `npm run dev` - ホットリロード付き開発モードで実行
- `npm run start` - コンパイル済みサーバーを実行
- `npm run lint` - ESLint を実行
- `npm run typecheck` - TypeScript 型チェックを実行

### 新しいツールの追加

1. `src/types/mcp.ts` で入力スキーマを定義
2. `src/tools/` 下の適切なファイルでツール実装を作成
3. `src/tools/index.ts` からエクスポート
4. ドキュメントを更新

## トラブルシューティング

### よくある問題

1. **API 接続失敗**
   - API 認証情報が正しいか確認
   - ネットワーク接続を確認
   - テストネットフラグがAPIキータイプと一致するか確認

2. **権限拒否**
   - API キーに必要な権限があるか確認
   - IP が Binance でホワイトリストに登録されているか確認

3. **無効なシンボル**
   - 正しいシンボル形式を使用（例：BTCUSDT、BTC/USDT ではなく）
   - シンボルが Binance に存在するか確認

4. **取引無効**
   - 取引機能に `BINANCE_TESTNET=true` を設定
   - テストネット API 認証情報を確認

### デバッグモード

詳細ログのために `LOG_LEVEL=debug` を設定：

```bash
LOG_LEVEL=debug npm run dev
```

## API レート制限

サーバーは Binance API レート制限を遵守：
- マーケットデータ：毎分1200リクエスト
- アカウントデータ：毎分180リクエスト
- 注文：毎秒10注文、24時間で100,000注文

## 貢献

1. リポジトリをフォーク
2. 機能ブランチを作成
3. 変更を実施
4. 該当する場合はテストを追加
5. ドキュメントを更新
6. プルリクエストを提出

## ライセンス

MIT ライセンス - 詳細は LICENSE ファイルを参照

## サポート

問題や質問について：
1. トラブルシューティングセクションを確認
2. Binance API ドキュメントを確認
3. GitHub で issue を開く

## 免責事項

このソフトウェアは教育および開発目的のみです。ご自身の責任でご使用ください。実際の資金を使用する前に、必ずテストネットでテストしてください。