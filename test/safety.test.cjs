const { test, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const { getNetworkMode, validateEnvironment, getServerConfig } = require('../dist/config/binance.js');
const { tradingTools } = require('../dist/tools/trading.js');
const { accountTools } = require('../dist/tools/account.js');
const { validatePrice, validateQuantity, validateSymbol } = require('../dist/utils/validation.js');
const { GetKlinesSchema, GetOrderBookSchema, CancelOrderSchema } = require('../dist/types/mcp.js');
const keys = ['BINANCE_API_KEY', 'BINANCE_API_SECRET', 'BINANCE_TESTNET', 'MCP_SERVER_VERSION'];
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
function captureWarnings() {
  const warnings = [];
  const original = console.warn;
  console.warn = (...args) => warnings.push(args.join(' '));
  return { warnings, restore: () => { console.warn = original; } };
}
test('missing network selects mainnet and non-true values are parsed leniently', () => {
  assert.equal(getNetworkMode(), 'mainnet');
  for (const value of ['TRUE', '1', 'yes', 'false', '']) {
    process.env.BINANCE_TESTNET = value;
    assert.equal(getNetworkMode(), 'mainnet');
    assert.doesNotThrow(validateEnvironment);
  }
  process.env.BINANCE_TESTNET = 'true';
  assert.equal(getNetworkMode(), 'testnet');
  assert.doesNotThrow(validateEnvironment);
});
test('missing credentials fail at startup', () => {
  delete process.env.BINANCE_API_KEY; assert.throws(validateEnvironment, /must be set/);
});
test('mutations reach the client on mainnet without extra flags and warn without blocking', async () => {
  const capture = captureWarnings();
  try {
    const calls = [];
    for (const tool of tradingTools) {
      const result = await tool.handler(mockClient(calls), inputs[tool.name]);
      assert.equal(result.network, 'mainnet');
    }
    assert.equal(calls.length, 3);
    assert.equal(calls[0].params.timeInForce, 'GTC');
    assert.ok(capture.warnings.some(message => /MAINNET/.test(message)));
  } finally { capture.restore(); }
});
test('mutations reach the client on testnet without extra flags and do not warn', async () => {
  process.env.BINANCE_TESTNET = 'true';
  const capture = captureWarnings();
  try {
    const calls = [];
    for (const tool of tradingTools) {
      const result = await tool.handler(mockClient(calls), inputs[tool.name]);
      assert.equal(result.network, 'testnet');
    }
    assert.equal(calls.length, 3);
    assert.equal(capture.warnings.length, 0);
  } finally { capture.restore(); }
});
test('invalid orders never reach Binance', async () => {
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
