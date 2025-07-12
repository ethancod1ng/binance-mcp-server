import { config } from 'dotenv';
import { BinanceConfig } from '../types/binance.js';

config();

export function getBinanceConfig(): BinanceConfig {
  const apiKey = process.env.BINANCE_API_KEY;
  const apiSecret = process.env.BINANCE_API_SECRET;
  const testnet = process.env.BINANCE_TESTNET === 'true';

  if (!apiKey || !apiSecret) {
    throw new Error('BINANCE_API_KEY and BINANCE_API_SECRET must be set in environment variables');
  }

  return {
    apiKey,
    apiSecret,
    sandbox: testnet,
    recvWindow: 60000,
    timeout: 15000,
    disableBeautification: true,
  };
}

export function validateEnvironment(): void {
  const requiredEnvVars = ['BINANCE_API_KEY', 'BINANCE_API_SECRET'];
  
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      throw new Error(`Required environment variable ${envVar} is not set`);
    }
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
  return {
    name: process.env.MCP_SERVER_NAME || 'binance-mcp-server',
    version: process.env.MCP_SERVER_VERSION || '1.0.0',
  };
}