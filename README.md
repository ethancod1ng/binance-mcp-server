# Binance MCP Server

> **多语言文档 / Multi-language Documentation**
> - [English](README.md) (current)
> - [中文](README_zh.md)
> - [日本語](README_ja.md)

A comprehensive Model Context Protocol (MCP) server that provides Claude Code with seamless access to Binance exchange API functionality.

## Features

- **Market Data Tools**: Get real-time prices, order book depth, K-line data, and 24-hour statistics
- **Account Management**: View account information, balances, open orders, and order history
- **Trading Operations**: Place orders, cancel orders (testnet only)
- **Full TypeScript Support**: Complete type definitions and validation
- **Security First**: Environment-based configuration with input validation
- **Error Handling**: Comprehensive error handling with sanitized logging

## Quick Start

### Installation

```bash
npm install
```

### Configuration

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Configure your Binance API credentials in `.env`:
```env
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_TESTNET=true
MCP_SERVER_NAME=binance-mcp-server
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

### Running the Server

Development mode:
```bash
npm run dev
```

Production build:
```bash
npm run build
npm start
```

## Available Tools

### Market Data Tools

#### get_price
Get current price for a trading pair.
```json
{
  "symbol": "BTCUSDT"
}
```

#### get_orderbook
Get order book depth data.
```json
{
  "symbol": "BTCUSDT",
  "limit": 100
}
```

#### get_klines
Get K-line/candlestick data.
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 500
}
```

#### get_24hr_ticker
Get 24-hour price change statistics.
```json
{
  "symbol": "BTCUSDT"
}
```

### Account Tools

#### get_account_info
Get account information and balances.
```json
{}
```

#### get_open_orders
Get current open orders.
```json
{
  "symbol": "BTCUSDT"
}
```

#### get_order_history
Get historical orders.
```json
{
  "symbol": "BTCUSDT",
  "limit": 500
}
```

### Trading Tools (Testnet Only)

#### place_order
Place a new order.
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
Cancel a specific order.
```json
{
  "symbol": "BTCUSDT",
  "orderId": 12345
}
```

#### cancel_all_orders
Cancel all open orders for a symbol.
```json
{
  "symbol": "BTCUSDT"
}
```

## Claude Code Integration

### Configuration

Add the following to your Claude Code MCP configuration:

```json
{
  "mcpServers": {
    "binance": {
      "command": "binance-mcp-server",
      "env": {
        "BINANCE_API_KEY": "your_api_key",
        "BINANCE_API_SECRET": "your_api_secret",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

### Usage Examples

Ask Claude to:
- \"Get the current price of Bitcoin\"
- \"Show me the order book for ETHUSDT\"
- \"Get 1-hour candlestick data for BTCUSDT\"
- \"Check my account balance\"
- \"Place a limit buy order for 0.001 BTC at $50,000\"

## Security

### Important Security Notes

1. **API Keys**: Never commit API keys to version control
2. **Testnet Only**: Trading functions only work with `BINANCE_TESTNET=true`
3. **Input Validation**: All inputs are validated using Zod schemas
4. **Error Sanitization**: Sensitive information is removed from error logs

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `BINANCE_API_KEY` | Yes | Your Binance API key |
| `BINANCE_API_SECRET` | Yes | Your Binance API secret |
| `BINANCE_TESTNET` | No | Enable testnet mode (default: false) |
| `MCP_SERVER_NAME` | No | Server name (default: binance-mcp-server) |
| `MCP_SERVER_VERSION` | No | Server version (default: 1.0.0) |
| `LOG_LEVEL` | No | Logging level (default: info) |

## Development

### Project Structure

```
binance-mcp-server/
├── src/
│   ├── index.ts              # Server entry point
│   ├── server.ts             # MCP server core
│   ├── tools/                # Tool modules
│   │   ├── market-data.ts    # Market data tools
│   │   ├── account.ts        # Account info tools
│   │   ├── trading.ts        # Trading tools
│   │   └── index.ts          # Tool exports
│   ├── types/                # TypeScript definitions
│   │   ├── binance.ts        # Binance API types
│   │   └── mcp.ts            # MCP input schemas
│   ├── config/
│   │   └── binance.ts        # Configuration management
│   └── utils/
│       ├── validation.ts     # Input validation
│       └── error-handling.ts # Error handling
├── dist/                     # Compiled JavaScript
├── .env.example              # Environment template
├── package.json
├── tsconfig.json
└── README.md
```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run in development mode with hot reload
- `npm run start` - Run the compiled server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking

### Adding New Tools

1. Define input schema in `src/types/mcp.ts`
2. Create tool implementation in appropriate file under `src/tools/`
3. Export from `src/tools/index.ts`
4. Update documentation

## Troubleshooting

### Common Issues

1. **API Connection Failed**
   - Verify API credentials are correct
   - Check network connectivity
   - Ensure testnet flag matches your API key type

2. **Permission Denied**
   - Verify API key has required permissions
   - Check if IP is whitelisted on Binance

3. **Invalid Symbol**
   - Use correct symbol format (e.g., BTCUSDT, not BTC/USDT)
   - Verify symbol exists on Binance

4. **Trading Disabled**
   - Set `BINANCE_TESTNET=true` for trading functions
   - Verify testnet API credentials

### Debug Mode

Set `LOG_LEVEL=debug` for detailed logging:

```bash
LOG_LEVEL=debug npm run dev
```

## API Rate Limits

The server respects Binance API rate limits:
- Market data: 1200 requests per minute
- Account data: 180 requests per minute
- Orders: 10 orders per second, 100,000 orders per 24 hours

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Update documentation
6. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review Binance API documentation
3. Open an issue on GitHub

## Disclaimer

This software is for educational and development purposes. Use at your own risk. Always test with testnet before using real funds.