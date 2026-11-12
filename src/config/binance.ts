import { config } from 'dotenv';
import { BinanceConfig } from '../types/binance.js';
// Resolve the installed package version without maintaining a second version string.
const { version } = require('../../package.json') as { version: string };

// stdout is reserved for JSON-RPC messages on the stdio transport.
config({ quiet: true });

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
}

export function isTestnetEnabled(): boolean {
  return process.env.BINANCE_TESTNET === 'true';
}

export function getNetworkMode(): 'testnet' | 'mainnet' {
  return isTestnetEnabled() ? 'testnet' : 'mainnet';
}

export function getLogLevel(): string {
  return process.env.LOG_LEVEL || 'info';
}

export function getServerConfig(): { name: string; version: string } {
  return { name: process.env.MCP_SERVER_NAME || 'binance-mcp-server', version };
}
