# Binance MCP 服务器

> **多语言文档**
> - [English](README.md)
> - [中文](README_zh.md) (当前)
> - [日本語](README_ja.md)

为 Claude Code 提供币安交易所 API 功能的 Model Context Protocol (MCP) 服务器。

## 快速开始

### 安装

```bash
npm install -g binance-mcp-server
```

### 配置

此 MCP 服务器可与多种支持 MCP 的 AI 工具配合使用：

[![Claude](https://img.shields.io/badge/Claude-FF6B35?style=for-the-badge&logo=anthropic&logoColor=white)](https://claude.ai)
[![Cursor](https://img.shields.io/badge/Cursor-000000?style=for-the-badge&logo=cursor&logoColor=white)](https://cursor.sh)

#### Claude Code

添加到您的 Claude Code MCP 配置中 (`claude_desktop_config.json`)：

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["binance-mcp-server"],
      "env": {
        "BINANCE_API_KEY": "您的_api_密钥",
        "BINANCE_API_SECRET": "您的_api_秘钥",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

#### Cursor

添加到您的 Cursor MCP 设置中 (`.cursor/mcp_config.json`)：

```json
{
  "mcpServers": {
    "binance": {
      "command": "npx",
      "args": ["binance-mcp-server"],
      "env": {
        "BINANCE_API_KEY": "您的_api_密钥",
        "BINANCE_API_SECRET": "您的_api_秘钥",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

### 环境设置

创建 `.env` 文件：
```env
BINANCE_API_KEY=您的_api_密钥
BINANCE_API_SECRET=您的_api_秘钥
BINANCE_TESTNET=true
```

## 可用工具

### 市场数据
- `get_price` - 获取交易对当前价格
- `get_orderbook` - 获取订单簿深度数据
- `get_klines` - 获取 K 线/蜡烛图数据
- `get_24hr_ticker` - 获取 24 小时价格统计

### 账户
- `get_account_info` - 获取账户信息和余额
- `get_open_orders` - 获取当前挂单
- `get_order_history` - 获取历史订单

### 交易（仅测试网）
- `place_order` - 下新订单
- `cancel_order` - 取消指定订单
- `cancel_all_orders` - 取消所有挂单

## 使用示例

询问 Claude：
- "获取比特币当前价格"
- "显示 ETHUSDT 的订单簿"
- "检查我的账户余额"
- "以 50,000 美元价格限价买入 0.001 BTC"

## 安全

⚠️ **重要**：为安全起见，交易功能仅在 `BINANCE_TESTNET=true` 时工作。

## 开发

```bash
npm run build    # 编译 TypeScript
npm run dev      # 开发模式
npm run lint     # 运行代码检查
```

## 许可证

MIT 许可证