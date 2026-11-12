# Development guide

Binance Spot MCP server using stdio. Node.js 24+ is required.

- `npm ci` installs the locked dependencies.
- `npm run check` runs type checking, ESLint and offline tests.
- `npm run dev` starts TypeScript; `npm start` starts compiled output.
- `npm pack --dry-run` checks the publish file list; `prepack` builds first.

## Architecture

`src/server.ts` registers ten tools from `src/tools/`. JSON schemas exposed to clients
and Zod validation in `src/types/mcp.ts` must stay consistent. Results are JSON text;
execution errors carry MCP `isError: true`. stdout is reserved for the stdio protocol.
Runtime version is read from package.json; do not add a second version constant.

## Network selection

BINANCE_TESTNET selects the network: exactly `true` means testnet; any other
value, including unset, means mainnet. All tools work on both networks,
including placing and cancelling orders. Before an order mutation on mainnet
the server logs a real-money warning to stderr, but never blocks the
operation. Never use real credentials or contact Binance from automated
tests; mock the client.

Docker uses `node:24-alpine`, a build stage and a non-root runtime. For stdio,
launch with `docker run --rm -i --env-file .env binance-mcp-server`; the MCP client
must own the process stdin/stdout. There is no HTTP listener or Compose deployment.

See README.md for supported tool inputs and CHANGELOG.md for migration instructions.
