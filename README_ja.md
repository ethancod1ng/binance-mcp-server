# Binance MCP サーバー

[![npm](https://img.shields.io/npm/dt/binance-mcp-server?logo=npm)](https://www.npmjs.com/package/binance-mcp-server)
[![smithery badge](https://smithery.ai/badge/@ethancod1ng/binance-mcp-server)](https://smithery.ai/server/@ethancod1ng/binance-mcp-server)

> **多言語ドキュメント**
> - [English](README.md)
> - [中文](README_zh.md)
> - [日本語](README_ja.md) (現在)

Claude Code に Binance 取引所 API 機能を提供する Model Context Protocol (MCP) サーバーです。

## クイックスタート

### 📹 ビデオチュートリアル

包括的な MCP 使用チュートリアルを視聴して、すぐに始めましょう：

![MCP 使用チュートリアル](docs/mcp-usage-tutorial.gif)

*注意：完全なビデオチュートリアルは `docs/mcp-usage-tutorial.mp4` で見つけることができます。*

### インストール

```bash
npm install -g binance-mcp-server
```

### 設定

この MCP サーバーは MCP をサポートする様々な AI ツールで使用できます：

[![Claude](https://img.shields.io/badge/Claude-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](https://cursor.sh)

#### MCP 設定

以下の設定を MCP 設定ファイルに追加してください：

**Claude Desktop**: `claude_desktop_config.json`  
**Cursor**: `.cursor/mcp_config.json`

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

#### API キーの取得

**テストネット（開発推奨）：**
1. [Binance テストネット](https://testnet.binance.vision/) にアクセス
2. テストネットアカウントを作成（実際の本人確認不要）
3. テストネットアカウントの API 管理に移動
4. 取引権限付きの新しい API キーを作成
5. 注意：テストネットは仮想資金を使用 - テスト用に完全に安全

**メインネット（本番環境）：**
1. [Binance](https://www.binance.com/) で認証済みアカウントを作成
2. KYC 本人確認を完了
3. アカウント設定の API 管理に移動
4. 必要な権限で新しい API キーを作成
5. ⚠️ **警告：メインネットは実際のお金を使用 - 十分注意してください！**

#### 設定

`.env` ファイルを作成：
```env
BINANCE_API_KEY=あなたの_api_キー
BINANCE_API_SECRET=あなたの_api_シークレット
BINANCE_TESTNET=true  # メインネット用に false に設定（実際のお金）
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

### 取引（メインネットとテストネット）
- `place_order` - 新しい注文を発注（メインネットとテストネットに対応）
- `cancel_order` - 特定の注文をキャンセル（メインネットとテストネットに対応）
- `cancel_all_orders` - 全ての未約定注文をキャンセル（メインネットとテストネットに対応）

## 使用例

Claude に尋ねる：
- "ビットコインの現在価格を取得して"
- "ETHUSDT のオーダーブックを表示して"
- "アカウント残高を確認して"
- "0.001 BTC を 50,000 ドルで指値買い注文を出して"

## セキュリティ

⚠️ **重要**：
- `BINANCE_TESTNET=true` を設定して仮想資金で安全にテスト
- `BINANCE_TESTNET=false` を設定または省略してメインネット取引（実際のお金）
- メインネット取引では注文実行前に警告が表示されます

## 開発

```bash
npm run build    # TypeScript コンパイル
npm run dev      # 開発モード
npm run lint     # リンティング実行
```