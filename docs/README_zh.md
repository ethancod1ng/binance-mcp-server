# Binance MCP 服务器

[English](../README.md) | [中文](README_zh.md) | [日本語](README_ja.md)

面向支持 MCP 的 AI 客户端，提供币安**现货**查询及交易功能，使用 stdio，共 10 个工具。要求 Node.js **24+**。未提供合约、提现或行情流订阅工具。

**2.0.0 尚未发布。** 发布前请从源码安装。升级行为见[发布说明](../CHANGELOG.md)。

## 从源码安装

```bash
git clone https://github.com/ethancod1ng/binance-mcp-server.git
cd binance-mcp-server
npm ci
npm run build
cp .env.example .env
```

复制 `.env.example` 为 `.env`，填写所选网络对应的密钥。目前即使只查询行情，启动时也需要 API Key 和 Secret。`.env` 从进程工作目录读取，推荐通过 MCP 客户端的 `env` 配置传入。

## MCP 客户端配置

将绝对路径替换为本机编译后的仓库路径。MCP 客户端负责启动进程及连接 stdin/stdout；服务不提供 HTTP 端口。以下配置仅允许查询。

```json
{
  "mcpServers": {
    "binance": {
      "command": "node",
      "args": [
        "/absolute/path/to/binance-mcp-server/dist/index.js"
      ],
      "env": {
        "BINANCE_API_KEY": "your_testnet_api_key",
        "BINANCE_API_SECRET": "your_testnet_api_secret",
        "BINANCE_TESTNET": "true",
        "BINANCE_ENABLE_TRADING": "false",
        "BINANCE_ALLOW_MAINNET_TRADING": "false"
      }
    }
  }
}
```

2.0.0 发布后，可将客户端设为 `command: "npx"`、`args: ["-y", "binance-mcp-server@2.0.0"]`，保留相同环境变量。运行时版本统一读取 package.json，`MCP_SERVER_VERSION` 不再生效。

## 交易开关与迁移

省略 `BINANCE_TESTNET` 现在会选择测试网。布尔值仅接受字符串 `true`、`false`，拼写错误会导致启动失败。从 1.x 升级时请检查已有配置。

测试网**下单和撤单**均须设置 `BINANCE_ENABLE_TRADING=true`。主网还须同时设置 `BINANCE_TESTNET=false`、`BINANCE_ALLOW_MAINNET_TRADING=true`，并使用主网密钥。这些是启动配置开关，不是逐笔交易确认；客户端是否弹出确认取决于客户端设置。仅授予所需 API 权限，无需提现权限。

## 工具清单

| 工具 | 参数及行为 |
|---|---|
| `get_price` | 必填 `symbol`。 |
| `get_orderbook` | 必填 `symbol`；`limit` 默认 100，可选 5、10、20、50、100、500、1000、5000。 |
| `get_klines` | 必填 `symbol`、`interval`；`limit` 1–1000，默认 500；未提供起止时间参数。 |
| `get_24hr_ticker` | `symbol` 可选；省略则查询全部交易对。 |
| `get_account_info` | 无需参数；仅返回非零余额，合计使用十进制计算。 |
| `get_open_orders` | `symbol` 可选；省略则查询所有挂单。 |
| `get_order_history` | 必填 `symbol`；`limit` 1–1000，默认 500；未提供时间或订单 ID 翻页。 |
| `place_order` | 必填 `symbol`、`side` BUY/SELL、`type` MARKET/LIMIT、`quantity`；数量是基础资产数量的十进制字符串。LIMIT 必填 `price`，固定 GTC。 |
| `cancel_order` | 必填 `symbol`、正安全整数 `orderId`。 |
| `cancel_all_orders` | 必填 `symbol`；仅撤销**该交易对**的全部挂单。 |

交易对使用大写字母及数字，例如 `1INCHUSDT`。价格和数量必须是正数十进制字符串。币安仍会校验交易对是否可用、价格步长、数量步长和最低成交金额。K 线周期支持 `1m`、`3m`、`5m`、`15m`、`30m`、`1h`、`2h`、`4h`、`6h`、`8h`、`12h`、`1d`、`3d`、`1w`、`1M`。

结果以 MCP 文本内容返回 JSON；工具执行失败返回 `isError: true`。服务额外添加的时间戳为本地毫秒时间，币安原始字段保留原有含义。

## 调用示例（测试网交易需先启用）

```json
{"name":"get_price","arguments":{"symbol":"BTCUSDT"}}
{"name":"get_klines","arguments":{"symbol":"ETHUSDT","interval":"1h","limit":24}}
{"name":"place_order","arguments":{"symbol":"BTCUSDT","side":"BUY","type":"LIMIT","quantity":"0.001","price":"50000"}}
```

## 开发与打包

```bash
npm run check
npm audit --omit=dev
npm pack --dry-run
docker build -t binance-mcp-server .
docker run --rm -i --env-file .env binance-mcp-server
```

启动失败时检查 Node 版本、密钥及布尔值。交易被禁用时检查上述开关；签名或时间戳错误时检查网络与密钥是否对应、系统时钟是否准确。提交问题时不要附带密钥。

[Tutorial](https://github.com/ethancod1ng/binance-mcp-server/blob/main/docs/mcp-usage-tutorial.gif) · [Changelog](../CHANGELOG.md) · [MIT License](../LICENSE)
