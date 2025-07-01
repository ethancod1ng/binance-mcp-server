# Binance MCP 服务器

一个全面的模型上下文协议 (MCP) 服务器，为 Claude Code 提供与 Binance 交易所 API 功能的无缝集成。

## 功能特性

- **市场数据工具**：获取实时价格、订单簿深度、K线数据和24小时统计信息
- **账户管理**：查看账户信息、余额、挂单和订单历史
- **交易操作**：下单、撤单（仅限测试网）
- **完整的 TypeScript 支持**：完整的类型定义和验证
- **安全优先**：基于环境变量的配置和输入验证
- **错误处理**：全面的错误处理和安全日志记录

## 快速开始

### 安装

```bash
npm install
```

### 配置

1. 复制环境变量模板：
```bash
cp .env.example .env
```

2. 在 `.env` 文件中配置你的 Binance API 凭证：
```env
BINANCE_API_KEY=你的API密钥
BINANCE_API_SECRET=你的API密钥秘钥
BINANCE_TESTNET=true
MCP_SERVER_NAME=binance-mcp-server
MCP_SERVER_VERSION=1.0.0
LOG_LEVEL=info
```

### 运行服务器

开发模式：
```bash
npm run dev
```

生产构建：
```bash
npm run build
npm start
```

## 可用工具

### 市场数据工具

#### get_price
获取交易对的当前价格。
```json
{
  "symbol": "BTCUSDT"
}
```

#### get_orderbook
获取订单簿深度数据。
```json
{
  "symbol": "BTCUSDT",
  "limit": 100
}
```

#### get_klines
获取K线/蜡烛图数据。
```json
{
  "symbol": "BTCUSDT",
  "interval": "1h",
  "limit": 500
}
```

#### get_24hr_ticker
获取24小时价格变动统计。
```json
{
  "symbol": "BTCUSDT"
}
```

### 账户工具

#### get_account_info
获取账户信息和余额。
```json
{}
```

#### get_open_orders
获取当前挂单。
```json
{
  "symbol": "BTCUSDT"
}
```

#### get_order_history
获取历史订单。
```json
{
  "symbol": "BTCUSDT",
  "limit": 500
}
```

### 交易工具（仅限测试网）

#### place_order
下新订单。
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
取消特定订单。
```json
{
  "symbol": "BTCUSDT",
  "orderId": 12345
}
```

#### cancel_all_orders
取消交易对的所有挂单。
```json
{
  "symbol": "BTCUSDT"
}
```

## Claude Code 集成

### 配置

将以下内容添加到你的 Claude Code MCP 配置中：

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": ["/path/to/binance-mcp-server/dist/index.js"],
      "env": {
        "BINANCE_API_KEY": "你的API密钥",
        "BINANCE_API_SECRET": "你的API密钥秘钥",
        "BINANCE_TESTNET": "true"
      }
    }
  }
}
```

### 使用示例

询问 Claude：
- "获取比特币当前价格"
- "显示我的账户余额"
- "获取 ETHUSDT 的订单簿"
- "查看我的挂单"
- "以 50000 美元的价格买入 0.001 个比特币"

## 安全

### 重要安全注意事项

1. **API 密钥**：永远不要将 API 密钥提交到版本控制系统
2. **仅限测试网**：交易功能仅在 `BINANCE_TESTNET=true` 时可用
3. **输入验证**：所有输入都使用 Zod 模式进行验证
4. **错误清理**：敏感信息会从错误日志中移除

### 环境变量

| 变量 | 必需 | 描述 |
|------|------|------|
| `BINANCE_API_KEY` | 是 | 你的 Binance API 密钥 |
| `BINANCE_API_SECRET` | 是 | 你的 Binance API 秘钥 |
| `BINANCE_TESTNET` | 否 | 启用测试网模式（默认：false） |
| `MCP_SERVER_NAME` | 否 | 服务器名称（默认：binance-mcp-server） |
| `MCP_SERVER_VERSION` | 否 | 服务器版本（默认：1.0.0） |
| `LOG_LEVEL` | 否 | 日志级别（默认：info） |

## 开发

### 项目结构

```
binance-mcp-server/
├── src/
│   ├── index.ts              # 服务器入口点
│   ├── server.ts             # MCP 服务器核心
│   ├── tools/                # 工具模块
│   │   ├── market-data.ts    # 市场数据工具
│   │   ├── account.ts        # 账户信息工具
│   │   ├── trading.ts        # 交易工具
│   │   └── index.ts          # 工具导出
│   ├── types/                # TypeScript 定义
│   │   ├── binance.ts        # Binance API 类型
│   │   └── mcp.ts            # MCP 输入模式
│   ├── config/
│   │   └── binance.ts        # 配置管理
│   └── utils/
│       ├── validation.ts     # 输入验证
│       └── error-handling.ts # 错误处理
├── dist/                     # 编译后的 JavaScript
├── .env.example              # 环境变量模板
├── package.json
├── tsconfig.json
└── README.md
```

### 脚本

- `npm run build` - 将 TypeScript 编译为 JavaScript
- `npm run dev` - 以热重载模式运行开发版本
- `npm run start` - 运行编译后的服务器
- `npm run lint` - 运行 ESLint
- `npm run typecheck` - 运行 TypeScript 类型检查

### 添加新工具

1. 在 `src/types/mcp.ts` 中定义输入模式
2. 在 `src/tools/` 下的适当文件中创建工具实现
3. 从 `src/tools/index.ts` 导出
4. 更新文档

## 故障排除

### 常见问题

1. **API 连接失败**
   - 验证 API 凭证是否正确
   - 检查网络连接
   - 确保测试网标志与你的 API 密钥类型匹配

2. **权限被拒绝**
   - 验证 API 密钥具有所需权限
   - 检查 IP 是否在 Binance 上加入白名单

3. **无效符号**
   - 使用正确的符号格式（例如 BTCUSDT，而非 BTC/USDT）
   - 验证符号在 Binance 上存在

4. **交易被禁用**
   - 为交易功能设置 `BINANCE_TESTNET=true`
   - 验证测试网 API 凭证

### 调试模式

设置 `LOG_LEVEL=debug` 以获得详细日志：

```bash
LOG_LEVEL=debug npm run dev
```

## API 速率限制

服务器遵守 Binance API 速率限制：
- 市场数据：每分钟 1200 个请求
- 账户数据：每分钟 180 个请求
- 订单：每秒 10 个订单，每24小时 100,000 个订单

## 贡献

1. Fork 仓库
2. 创建功能分支
3. 进行更改
4. 如适用，添加测试
5. 更新文档
6. 提交拉取请求

## 许可证

MIT 许可证 - 详见 LICENSE 文件

## 支持

如有问题和疑问：
1. 查看故障排除部分
2. 查阅 Binance API 文档
3. 在 GitHub 上开启 issue

## 免责声明

本软件仅用于教育和开发目的。使用风险自负。在使用真实资金之前，请始终先在测试网上进行测试。