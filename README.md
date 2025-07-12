# Binance MCP Server

> **Multi-language Documentation**
> - [English](README.md) (current)
> - [中文](README_zh.md)
> - [日本語](README_ja.md)

A Model Context Protocol (MCP) server that provides Claude Code with Binance exchange API functionality.

## Quick Start

### Installation

```bash
npm install -g binance-mcp-server
```

### Configuration

This MCP server can be used with various AI tools that support MCP:

[![Claude](https://img.shields.io/badge/Claude-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](https://cursor.sh)

#### Claude Code

Add to your Claude Code MCP configuration (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["binance-mcp-server"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_API_SECRET": "your_api_secret",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

#### Cursor

Add to your Cursor MCP settings (`.cursor/mcp_config.json`):

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["binance-mcp-server"],
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_API_SECRET": "your_api_secret", 
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```


### Environment Setup

Create `.env` file:
```env
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_TESTNET=true
```

## Available Tools

### Market Data
- `get_price` - Get current price for trading pair
- `get_orderbook` - Get order book depth data
- `get_klines` - Get K-line/candlestick data
- `get_24hr_ticker` - Get 24-hour price statistics

### Account
- `get_account_info` - Get account information and balances
- `get_open_orders` - Get current open orders
- `get_order_history` - Get historical orders

### Trading (Testnet Only)
- `place_order` - Place a new order
- `cancel_order` - Cancel specific order
- `cancel_all_orders` - Cancel all open orders

## Usage Examples

Ask Claude to:
- "Get the current price of Bitcoin"
- "Show me the order book for ETHUSDT"
- "Check my account balance"
- "Place a limit buy order for 0.001 BTC at $50,000"

## Security

⚠️ **Important**: Trading functions only work with `BINANCE_TESTNET=true` for safety.

## Development

```bash
npm run build    # Compile TypeScript
npm run dev      # Development mode
npm run lint     # Run linting
```

## License

MIT License