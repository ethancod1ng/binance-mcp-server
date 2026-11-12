const { test } = require('node:test');
const assert = require('node:assert/strict');
const { resolve } = require('node:path');
const { Client } = require('@modelcontextprotocol/sdk/client/index.js');
const { StdioClientTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');

test('stdio initializes, lists ten tools and returns errors without trading', { timeout: 15000 }, async () => {
  const entry = process.env.MCP_TEST_ENTRY || resolve(__dirname, '../dist/index.js');
  const client = new Client({ name: 'maintenance-test', version: '1.0.0' });
  const transport = new StdioClientTransport({
    command: process.execPath, args: [entry], stderr: 'pipe',
    env: { BINANCE_API_KEY: 'dummy-key', BINANCE_API_SECRET: 'dummy-secret', BINANCE_TESTNET: 'true' },
  });
  try {
    await client.connect(transport);
    assert.equal(client.getServerVersion().version, require('../package.json').version);
    assert.ok(client.getServerCapabilities().tools);
    const { tools } = await client.listTools();
    assert.deepEqual(tools.map(tool => tool.name).sort(), ['get_price', 'get_orderbook', 'get_klines', 'get_24hr_ticker', 'get_account_info', 'get_open_orders', 'get_order_history', 'place_order', 'cancel_order', 'cancel_all_orders'].sort());
    const invalid = await client.callTool({ name: 'get_price', arguments: { symbol: 'bad-symbol' } });
    assert.equal(invalid.isError, true);
    const invalidOrder = await client.callTool({ name: 'place_order', arguments: { symbol: 'BTCUSDT', side: 'BUY', type: 'LIMIT', quantity: '1' } });
    assert.equal(invalidOrder.isError, true);
    assert.match(invalidOrder.content[0].text, /Price is required/);
    assert.doesNotMatch(invalidOrder.content[0].text, /Trading is disabled/);
    await assert.rejects(client.callTool({ name: 'unknown_tool', arguments: {} }));
  } finally {
    await client.close();
    await transport.close();
  }
});
