import { config } from 'dotenv';
import { BinanceConfig } from '../types/binance.js';
// Resolve the installed package version without maintaining a second version string.
const { version } = require('../../package.json') as { version: string };

// stdout is reserved for JSON-RPC messages on the stdio transport.
config({ quiet: true });

function readBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name];
  if (value === undefined) return fallback;
  if (value !== 'true' && value !== 'false') {
    throw new Error(`${name} must be exactly "true" or "false"`);
  }
  return value === 'true';
}

export function getBinanceConfig(): BinanceConfig {
  validateEnvironment();
  return {
    apiKey: process.env.BINANCE_API_KEY!,
    apiSecret: process.env.BINANCE_API_SECRET!,
    sandbox: isTestnetEnabled(),
  };
}

export function validateEnvironment(): void {
  for (const name of ['BINANCE_API_KEY', 'BINANCE_API_SECRET']) {
    if (!process.env[name]?.trim()) throw new Error(`${name} must be set`);
  }
  isTestnetEnabled();
  readBoolean('BINANCE_ENABLE_TRADING', false);
  readBoolean('BINANCE_ALLOW_MAINNET_TRADING', false);
}

export function isTestnetEnabled(): boolean {
  return readBoolean('BINANCE_TESTNET', true);
}

export function getNetworkMode(): 'testnet' | 'mainnet' {
  return isTestnetEnabled() ? 'testnet' : 'mainnet';
}

export function assertTradingAllowed(): 'testnet' | 'mainnet' {
  if (!readBoolean('BINANCE_ENABLE_TRADING', false)) {
    throw new Error('Trading is disabled. Set BINANCE_ENABLE_TRADING=true to enable order mutations.');
  }
  const network = getNetworkMode();
  if (network === 'mainnet' && !readBoolean('BINANCE_ALLOW_MAINNET_TRADING', false)) {
    throw new Error('Mainnet trading is disabled. Set BINANCE_ALLOW_MAINNET_TRADING=true explicitly.');
  }
  return network;
}

export function getLogLevel(): string {
  return process.env.LOG_LEVEL || 'info';
}

export function getServerConfig(): { name: string; version: string } {
  return { name: process.env.MCP_SERVER_NAME || 'binance-mcp-server', version };
}
