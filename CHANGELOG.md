# Changelog

## 2.0.0 — Unreleased

### Breaking changes and migration

- Node.js 24 or newer is required; Docker uses Node 24.
- An omitted BINANCE_TESTNET now selects testnet, rather than mainnet. Boolean
  flags accept only the exact strings `true` and `false`.
- Placing AND cancelling orders now require BINANCE_ENABLE_TRADING=true.
  Mainnet also requires BINANCE_TESTNET=false and BINANCE_ALLOW_MAINNET_TRADING=true.
  Keep both trading flags false to query only. Choose keys issued for the selected network.
- Runtime version comes from package.json. MCP_SERVER_VERSION is no longer used.
- Price and quantity must be positive plain decimal strings. Exponents, whitespace,
  non-finite values and numeric suffixes are rejected. Limits and order IDs are checked.

### Maintenance

- Upgrade MCP SDK to 1.32.2, binance-api-node to 0.13.10, dotenv and supported tooling.
  Upgrade Zod to 4.6.7 and refresh ws to a patched release after dependency audit.
  SDK 2.x migration is outside this release.
- Declare MCP tools capability explicitly and keep dotenv output off stdout.
- Use decimal arithmetic for account balance totals; support symbols containing digits.
- Remove unused client configuration fields that never affected requests.
- Synchronize package/lock/runtime versions; build before packing; include translated docs.
- Add offline trading guard, validation, balance and stdio protocol tests, CI, and LICENSE.
- Update English, Chinese, Japanese and Smithery configuration and correct deployment docs.

## 1.1.2 — Repository version, 2026-01-31

- package.json changed from 1.1.1 to 1.1.2; lockfile/runtime versions were not updated.
- README installation and usage instructions were updated.
- npm publication and the exact published artifact have not been verified here.

Earlier versions have not been reconstructed. Do not infer changes from version numbers.

## Known limitations

- Public market-data tools still require API credentials at server startup.
- Binance endpoints have not been exercised with real credentials in this upgrade.
- Development-only glob dependencies have a moderate minimatch advisory; upgrading
  them across major versions via overrides is deferred to compatible upstream releases.
  Production dependencies are audited separately in CI.

## Release checklist

Run `npm ci`, `npm run check`, `npm audit --omit=dev`, and `npm pack --dry-run`.
Install the packed archive into an empty directory and verify the stdio handshake.
After review, date the release, tag the matching commit, publish the verified package,
and create a GitHub Release linking that tag. Publishing is a separate action.
