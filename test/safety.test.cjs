const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { getNetworkMode, validateEnvironment, getServerConfig } = require('../dist/config/binance.js');
const { tradingTools } = require('../dist/tools/trading.js');
const { accountTools } = require('../dist/tools/account.js');
const { validatePrice, validateQuantity, validateSymbol } = require('../dist/utils/validation.js');
const { GetKlinesSchema, GetOrderBookSchema, CancelOrderSchema } = require('../dist/types/mcp.js');
const keys = ['BINANCE_API_KEY', 'BINANCE_API_SECRET', 'BINANCE_TESTNET', 'BINANCE_ENABLE_TRADING', 'BINANCE_ALLOW_MAINNET_TRADING', 'MCP_SERVER_VERSION'];
let saved;
beforeEach(() => {
  saved = Object.fromEntries(keys.map(key => [key, process.env[key]]));
  keys.forEach(key => delete process.env[key]);
  process.env.BINANCE_API_KEY = 'test-key';
  process.env.BINANCE_API_SECRET = 'test-secret';
});
afterEach(() => keys.forEach(key => {
  if (saved[key] === undefined) delete process.env[key]; else process.env[key] = saved[key];
}));
const inputs = {
  place_order: { symbol: 'BTCUSDT', side: 'BUY', type: 'LIMIT', quantity: '0.001', price: '50000' },
  cancel_order: { symbol: 'BTCUSDT', orderId: 1 },
  cancel_all_orders: { symbol: 'BTCUSDT' },
};
function mockClient(calls) {
  return Object.fromEntries(['order', 'cancelOrder', 'cancelOpenOrders'].map(name => [name, async params => {
    calls.push({ name, params }); return name === 'cancelOpenOrders' ? [] : { ...params, orderId: 1 };
  }]));
}
test('missing network selects testnet; all mutations are disabled by default', async () => {
  assert.equal(getNetworkMode(), 'testnet');
  const calls = [];
  for (const tool of tradingTools) await assert.rejects(tool.handler(mockClient(calls), inputs[tool.name]), /Trading is disabled/);
  assert.equal(calls.length, 0);
});
test('malformed boolean flags and missing credentials fail at startup', () => {
  for (const key of ['BINANCE_TESTNET', 'BINANCE_ENABLE_TRADING', 'BINANCE_ALLOW_MAINNET_TRADING']) {
    process.env[key] = 'TRUE'; assert.throws(validateEnvironment, /must be exactly/); delete process.env[key];
  }
  delete process.env.BINANCE_API_KEY; assert.throws(validateEnvironment, /must be set/);
});
test('testnet mutations require opt-in and LIMIT orders use GTC', async () => {
  process.env.BINANCE_ENABLE_TRADING = 'true';
  const calls = [];
  for (const tool of tradingTools) {
    const result = await tool.handler(mockClient(calls), inputs[tool.name]);
    assert.equal(result.network, 'testnet');
  }
  assert.equal(calls.length, 3);
  assert.equal(calls[0].params.timeInForce, 'GTC');
});
test('mainnet mutations require a separate opt-in', async () => {
  process.env.BINANCE_TESTNET = 'false'; process.env.BINANCE_ENABLE_TRADING = 'true';
  const calls = [];
  for (const tool of tradingTools) await assert.rejects(tool.handler(mockClient(calls), inputs[tool.name]), /Mainnet trading is disabled/);
  assert.equal(calls.length, 0);
  process.env.BINANCE_ALLOW_MAINNET_TRADING = 'true';
  for (const tool of tradingTools) assert.equal((await tool.handler(mockClient(calls), inputs[tool.name])).network, 'mainnet');
  assert.equal(calls.length, 3);
});
test('invalid orders never reach Binance', async () => {
  process.env.BINANCE_ENABLE_TRADING = 'true';
  const calls = [], tool = tradingTools[0], client = mockClient(calls);
  for (const quantity of ['1abc', 'Infinity', '-1', '0']) {
    await assert.rejects(tool.handler(client, { ...inputs.place_order, quantity }));
  }
  await assert.rejects(tool.handler(client, { ...inputs.place_order, price: undefined }), /Price is required/);
  assert.equal(calls.length, 0);
});
test('symbols support digits and numeric inputs reject malformed strings and limits', () => {
  validateSymbol('1INCHUSDT'); validatePrice('0.00001'); validateQuantity('12.50');
  for (const value of ['1abc', 'Infinity', '1e3', ' 1', '0', '-1']) {
    assert.throws(() => validatePrice(value)); assert.throws(() => validateQuantity(value));
  }
  for (const limit of [0, -1, 1001, 1.5]) assert.equal(GetKlinesSchema.safeParse({ symbol: 'BTCUSDT', interval: '1m', limit }).success, false);
  assert.equal(GetOrderBookSchema.safeParse({ symbol: 'BTCUSDT', limit: 7 }).success, false);
  for (const orderId of [0, 1.5, Number.MAX_SAFE_INTEGER + 1]) assert.equal(CancelOrderSchema.safeParse({ symbol: 'BTCUSDT', orderId }).success, false);
});
test('balance totals use decimal arithmetic', async () => {
  const result = await accountTools[0].handler({ accountInfo: async () => ({ balances: [{ asset: 'BTC', free: '0.1', locked: '0.2' }] }) }, {});
  assert.equal(result.balances[0].total, '0.3');
});
test('runtime version matches installed package and ignores stale environment overrides', () => {
  process.env.MCP_SERVER_VERSION = '1.0.0';
  assert.equal(getServerConfig().version, require('../package.json').version);
});
