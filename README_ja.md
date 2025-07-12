# Binance MCP サーバー

> **多言語ドキュメント**
> - [English](README.md)
> - [中文](README_zh.md)
> - [日本語](README_ja.md) (現在)

Claude Code に Binance 取引所 API 機能を提供する Model Context Protocol (MCP) サーバーです。

## クイックスタート

### インストール

```bash
npm install -g binance-mcp-server
```

### 設定

この MCP サーバーは MCP をサポートする様々な AI ツールで使用できます：

[![Claude](https://img.shields.io/badge/Claude-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](https://cursor.sh)

#### Claude Code

Claude Code MCP 設定に追加 (`claude_desktop_config.json`)：

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["binance-mcp-server"],
      "env": {
        "BINANCE_API_KEY": "あなたの_api_キー",
        "BINANCE_API_SECRET": "あなたの_api_シークレット",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

#### Cursor

Cursor MCP 設定に追加 (`.cursor/mcp_config.json`)：

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["binance-mcp-server"],
      "env": {
        "BINANCE_API_KEY": "あなたの_api_キー",
        "BINANCE_API_SECRET": "あなたの_api_シークレット",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

### 環境設定

`.env` ファイルを作成：
```env
BINANCE_API_KEY=あなたの_api_キー
BINANCE_API_SECRET=あなたの_api_シークレット
BINANCE_TESTNET=true
```

## 利用可能なツール

### マーケットデータ
- `get_price` - 取引ペアの現在価格を取得
- `get_orderbook` - オーダーブックの深度データを取得
- `get_klines` - K線/ローソク足データを取得
- `get_24hr_ticker` - 24時間価格統計を取得

### アカウント
- `get_account_info` - アカウント情報と残高を取得
- `get_open_orders` - 現在の未約定注文を取得
- `get_order_history` - 注文履歴を取得

### 取引（テストネットのみ）
- `place_order` - 新しい注文を発注
- `cancel_order` - 特定の注文をキャンセル
- `cancel_all_orders` - 全ての未約定注文をキャンセル

## 使用例

Claude に尋ねる：
- "ビットコインの現在価格を取得して"
- "ETHUSDT のオーダーブックを表示して"
- "アカウント残高を確認して"
- "0.001 BTC を 50,000 ドルで指値買い注文を出して"

## セキュリティ

⚠️ **重要**：安全のため、取引機能は `BINANCE_TESTNET=true` でのみ動作します。

## 開発

```bash
npm run build    # TypeScript コンパイル
npm run dev      # 開発モード
npm run lint     # リンティング実行
```

## ライセンス

MIT ライセンス