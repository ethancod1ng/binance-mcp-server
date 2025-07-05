#!/usr/bin/env node

import { BinanceMCPServer } from './server.js';
import { logError } from './utils/error-handling.js';

process.env.TZ = process.env.TZ || Intl.DateTimeFormat().resolvedOptions().timeZone;

async function main(): Promise<void> {
  try {
    const server = new BinanceMCPServer();
    await server.start();
  } catch (error) {
    logError(error as Error);
    process.exit(1);
  }
}

if (require.main === module) {
  main().catch((error) => {
    logError(error);
    process.exit(1);
  });
}

export { BinanceMCPServer };