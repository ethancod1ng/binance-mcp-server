# Binance MCP Server

[![npm](https://img.shields.io/npm/dt/binance-mcp-server?logo=npm)](https://www.npmjs.com/package/binance-mcp-server)
[![smithery badge](https://smithery.ai/badge/@ethancod1ng/binance-mcp-server)](https://smithery.ai/server/@ethancod1ng/binance-mcp-server)

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

#### MCP Configuration

Add the following configuration to your MCP settings file:

**Claude Desktop**: `claude_desktop_config.json`  
**Cursor**: `.cursor/mcp_config.json`

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

#### Getting API Keys

**For Testnet (Recommended for Development):**
1. Visit [Binance Testnet](https://testnet.binance.vision/)
2. Create a testnet account (no real verification required)
3. Go to API Management in your testnet account
4. Create a new API key with trading permissions
5. Note: Testnet uses virtual funds - completely safe for testing

**For Mainnet (Production):**
1. Create a verified account on [Binance](https://www.binance.com/)
2. Complete KYC verification
3. Go to API Management in your account settings
4. Create a new API key with required permissions
5. ⚠️ **Warning: Mainnet uses real money - be very careful!**

#### Configuration

Create `.env` file:
```env
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_TESTNET=true  # Set to false for mainnet (REAL money)
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

### Trading (Mainnet & Testnet)
- `place_order` - Place a new order (supports both mainnet and testnet)
- `cancel_order` - Cancel specific order (supports both mainnet and testnet)
- `cancel_all_orders` - Cancel all open orders (supports both mainnet and testnet)

## Usage Examples

Ask Claude to:
- "Get the current price of Bitcoin"
- "Show me the order book for ETHUSDT"
- "Check my account balance"
- "Place a limit buy order for 0.001 BTC at $50,000"

## Security

⚠️ **Important**: 
- Set `BINANCE_TESTNET=true` for safe testing with virtual funds
- Set `BINANCE_TESTNET=false` or omit for mainnet trading with REAL money
- Mainnet trading will display warnings before executing orders

## Development

```bash
npm run build    # Compile TypeScript
npm run dev      # Development mode
npm run lint     # Run linting
```

## License

MIT License
