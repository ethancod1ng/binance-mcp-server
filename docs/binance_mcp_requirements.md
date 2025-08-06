# Binance MCP Server 开发需求

请开发一个完整的 Binance MCP (Model Context Protocol) Server，让 Claude 能够通过标准化接口访问 Binance 交易所的 API 功能。

## 项目要求

### 技术栈
- TypeScript + Node.js
- MCP SDK: `@modelcontextprotocol/sdk`
- Binance API: `binance-api-node`
- 验证库: `zod`
- 环境配置: `dotenv`

### 项目结构
```
binance-mcp-server/
├── src/
│   ├── index.ts              # 服务器入口
│   ├── server.ts             # MCP 服务器核心
│   ├── tools/                # 工具模块
│   │   ├── market-data.ts    # 市场数据工具
│   │   ├── account.ts        # 账户信息工具
│   │   ├── trading.ts        # 交易工具
│   │   └── index.ts
│   ├── types/                # TypeScript 类型定义
│   │   ├── binance.ts
│   │   └── mcp.ts
│   ├── config/
│   │   └── binance.ts        # Binance 配置
│   └── utils/
│       ├── validation.ts
│       └── error-handling.ts
├── .env.example
├── package.json
├── tsconfig.json
└── README.md
```

## 核心功能需求

### 1. 市场数据工具 (market-data.ts)
实现以下 MCP 工具：

**get_price**
- 功能：获取指定交易对当前价格
- 参数：symbol (string, 必需) - 交易对符号如 "BTCUSDT"
- 返回：JSON 格式的价格信息

**get_orderbook**
- 功能：获取订单簿深度
- 参数：
  - symbol (string, 必需) - 交易对符号
  - limit (number, 可选) - 深度限制，默认100
- 返回：买卖盘深度数据

**get_klines**
- 功能：获取K线数据
- 参数：
  - symbol (string, 必需) - 交易对符号
  - interval (enum, 必需) - 时间间隔: '1m', '5m', '15m', '1h', '4h', '1d' 等
  - limit (number, 可选) - 数量限制，默认500
- 返回：K线历史数据

**get_24hr_ticker**
- 功能：获取24小时价格变动统计
- 参数：symbol (string, 可选) - 不传则获取所有交易对
- 返回：24小时统计数据

### 2. 账户信息工具 (account.ts)
实现以下 MCP 工具：

**get_account_info**
- 功能：获取账户信息和余额
- 参数：无
- 返回：账户余额、权限信息

**get_open_orders**
- 功能：获取当前挂单
- 参数：symbol (string, 可选) - 特定交易对的挂单
- 返回：当前所有或指定交易对的挂单

**get_order_history**
- 功能：获取历史订单
- 参数：
  - symbol (string, 必需) - 交易对符号
  - limit (number, 可选) - 数量限制，默认500
- 返回：历史订单记录

### 3. 交易工具 (trading.ts)
实现以下 MCP 工具（仅测试网环境）：

**place_order**
- 功能：下单交易
- 参数：
  - symbol (string, 必需) - 交易对
  - side (enum, 必需) - 'BUY' | 'SELL'
  - type (enum, 必需) - 'MARKET' | 'LIMIT'
  - quantity (string, 必需) - 数量
  - price (string, LIMIT单必需) - 价格
- 返回：订单确认信息
- 安全要求：仅在 BINANCE_TESTNET=true 时可用

**cancel_order**
- 功能：取消订单
- 参数：
  - symbol (string, 必需) - 交易对
  - orderId (number, 必需) - 订单ID
- 返回：取消确认信息

**cancel_all_orders**
- 功能：取消指定交易对所有挂单
- 参数：symbol (string, 必需) - 交易对
- 返回：批量取消结果

## 技术实现要求

### 1. MCP 服务器实现 (server.ts)
- 使用 `@modelcontextprotocol/sdk` 创建 MCP 服务器
- 实现 `ListToolsRequestSchema` 处理器列出所有工具
- 实现 `CallToolRequestSchema` 处理器执行工具调用
- 添加完整的错误处理和日志记录
- 使用 StdioServerTransport 作为传输层

### 2. 类型定义 (types/)
- 定义完整的 Binance API 响应类型
- 使用 zod 创建输入验证 schema
- 定义 MCP 工具的参数和返回类型

### 3. 配置管理 (config/binance.ts)
- 从环境变量读取 API 配置：
  - BINANCE_API_KEY
  - BINANCE_API_SECRET  
  - BINANCE_TESTNET (boolean)
- 支持测试网和生产网切换
- 配置 API 限制和超时设置

### 4. 错误处理
- API 调用异常处理
- 参数验证错误处理
- 网络超时和重试机制
- 返回用户友好的错误信息

### 5. 安全要求
- API 密钥通过环境变量管理
- 交易功能默认禁用，仅测试网可用
- 输入参数严格验证
- 敏感信息不记录到日志

## 环境配置

### .env.example 文件
```env
# Binance API 配置
BINANCE_API_KEY=your_api_key_here
BINANCE_API_SECRET=your_api_secret_here
BINANCE_TESTNET=true

# 服务器配置
MCP_SERVER_NAME=binance-mcp-server
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

### package.json 脚本
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx src/index.ts",
    "watch": "nodemon --exec tsx src/index.ts"
  },
  "bin": {
    "binance-mcp-server": "./dist/index.js"
  }
}
```

## MCP 工具规范

每个工具必须包含：
- name: 工具名称（唯一标识）
- description: 工具功能描述
- inputSchema: JSON Schema 格式的参数定义
- 实现函数返回标准 MCP 响应格式

示例工具定义：
```typescript
{
  name: 'get_price',
  description: '获取指定交易对的当前价格',
  inputSchema: {
    type: 'object',
    properties: {
      symbol: {
        type: 'string',
        description: '交易对符号，如 BTCUSDT'
      }
    },
    required: ['symbol']
  }
}
```

## 测试要求

创建基本的功能测试：
- 市场数据获取测试
- 账户信息查询测试  
- 参数验证测试
- 错误处理测试
- MCP 协议兼容性测试

## 文档要求

创建详细的 README.md：
- 项目介绍和功能特性
- 安装和配置步骤
- 环境变量说明
- 所有工具的使用示例
- Claude Code 集成配置
- 安全注意事项
- 故障排除指南

## 部署和集成

- 项目可通过 npm 全局安装
- 支持作为 MCP 服务器被 Claude Code 调用
- 提供 Claude Code 配置文件示例
- 支持 Docker 容器化部署（可选）

## 验收标准

1. ✅ 所有工具都能正常响应 MCP 协议调用
2. ✅ 参数验证和错误处理完整
3. ✅ 测试网环境下交易功能正常
4. ✅ Claude Code 能成功集成和调用
5. ✅ 文档完整，示例清晰
6. ✅ 代码结构清晰，类型定义完整
7. ✅ 安全配置正确，生产环境安全

请完整实现这个 Binance MCP Server，确保所有功能都能在 Claude Code 环境中正常工作。