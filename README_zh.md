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

#### MCP 配置

将以下配置添加到您的 MCP 设置文件中：

**Claude Desktop**: `claude_desktop_config.json`  
**Cursor**: `.cursor/mcp_config.json`

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

#### 获取 API 密钥

**测试网（推荐用于开发）：**
1. 访问 [币安测试网](https://testnet.binance.vision/)
2. 创建测试网账户（无需真实身份验证）
3. 进入测试网账户的 API 管理
4. 创建新的 API 密钥并开启交易权限
5. 注意：测试网使用虚拟资金 - 完全安全，用于测试

**主网（生产环境）：**
1. 在 [币安](https://www.binance.com/) 创建已验证的账户
2. 完成 KYC 身份验证
3. 进入账户设置的 API 管理
4. 创建新的 API 密钥并设置所需权限
5. ⚠️ **警告：主网使用真实资金 - 请格外小心！**

#### 配置

创建 `.env` 文件：
```env
BINANCE_API_KEY=您的_api_密钥
BINANCE_API_SECRET=您的_api_秘钥
BINANCE_TESTNET=true  # 设置为 false 以使用主网（真实资金）
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

### 交易（主网和测试网）
- `place_order` - 下新订单（支持主网和测试网）
- `cancel_order` - 取消指定订单（支持主网和测试网）
- `cancel_all_orders` - 取消所有挂单（支持主网和测试网）

## 使用示例

询问 Claude：
- "获取比特币当前价格"
- "显示 ETHUSDT 的订单簿"
- "检查我的账户余额"
- "以 50,000 美元价格限价买入 0.001 BTC"

## 安全

⚠️ **重要**：
- 设置 `BINANCE_TESTNET=true` 使用虚拟资金进行安全测试
- 设置 `BINANCE_TESTNET=false` 或省略以进行主网交易（真实资金）
- 主网交易将在执行订单前显示警告

## 开发

```bash
npm run build    # 编译 TypeScript
npm run dev      # 开发模式
npm run lint     # 运行代码检查
```

## 许可证

MIT 许可证