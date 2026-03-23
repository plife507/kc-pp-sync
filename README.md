# KC PP Sync

Matches Jobber paid invoices to HeyPros jobs by WO# (`purchaseOrder`), detects missing `PAID BY CLIENT` labels, and writes audit results to a Google Sheet.

By default, fetches real paid invoices from the Jobber GraphQL API. Use `--mock-jobber` to fall back to fixture data.

## Setup

```bash
cd projects/kc-pp-sync
npm install
```

Copy `.env.example` to `.env` and fill in credentials (or rely on env vars already set).

Jobber auth is self-contained: the adapter automatically refreshes the OAuth token when it expires or is within 5 minutes of expiring. Set `JOBBER_CLIENT_ID` and `JOBBER_CLIENT_SECRET` (or have them in `kc/.env`) to enable auto-refresh.

## Run

```bash
# Real Jobber + real HeyPros, dry-run sheet output
npm start -- --dry-run

# Real Jobber + real HeyPros + real Google Sheet write
npm start

# Mock both sides (no live API calls, no sheet writes)
npm start -- --mock-heypros --mock-jobber --dry-run

# Mock Jobber only with a custom fixture
npm start -- --mock-jobber --fixture=my-scenario --dry-run
```

### CLI flags

| Flag | Effect |
|---|---|
| `--dry-run` | Skip Google Sheets write; print results to console |
| `--mock-heypros` | Use built-in mock HeyPros data instead of live API |
| `--mock-jobber` | Use fixture data instead of live Jobber API |
| `--fixture=NAME` | Load `fixtures/NAME.json` instead of `fixtures/default.json` (requires `--mock-jobber`) |

## Tests

```bash
npm test
```

## Architecture

```
src/
  config/env.ts        — env var loading (HeyPros, Jobber, Sheets)
  config/types.ts      — shared types, Jobber GraphQL types, constants
  adapters/heypros.ts  — HeyPros GraphQL auth + paginated job fetch
  adapters/jobber.ts   — real Jobber GraphQL paid invoice fetch
  adapters/jobber-mock.ts — loads Jobber fixtures from JSON
  adapters/sheets.ts   — Google Sheets write via gog CLI
  core/matcher.ts      — matches Jobber paid jobs to HeyPros by WO#
  index.ts             — CLI entrypoint
fixtures/
  default.json         — default Jobber paid-job fixture
test/
  matcher.test.ts      — matcher edge case tests
```

## Env vars

| Variable | Required | Default | Description |
|---|---|---|---|
| `HEYPROS_GRAPHQL_URL` | Yes | — | HeyPros GraphQL endpoint |
| `HEYPROS_TENANT` | Yes | — | Tenant header value |
| `HEYPROS_EMAIL` | Yes | — | Login email |
| `HEYPROS_PASSWORD` | Yes | — | Login password |
| `JOBBER_TOKEN_PATH` | No | `/data/.openclaw/workspace-aya-dev/kc/tokens/jobber_tokens.json` | Path to Jobber OAuth token JSON |
| `JOBBER_API_URL` | No | `https://api.getjobber.com/api/graphql` | Jobber GraphQL endpoint |
| `JOBBER_API_VERSION` | No | `2025-04-16` | X-JOBBER-GRAPHQL-VERSION header |
| `JOBBER_CLIENT_ID` | No* | — | Jobber OAuth client ID (required for auto-refresh) |
| `JOBBER_CLIENT_SECRET` | No* | — | Jobber OAuth client secret (required for auto-refresh) |
| `SYNC_LOOKBACK_DAYS` | No | `7` | Default lookback window for incremental sync |
| `GOOGLE_SHEETS_DEFAULT_ID` | No | — | Existing sheet ID (creates new if empty) |
| `SHEETS_DRY_RUN` | No | — | Set `true` to skip sheet writes |

## Jobber integration

The adapter manages its own OAuth tokens. On each API call it checks the access token's expiry (preferring the JWT `exp` claim, falling back to `expires_at` in the token file). If the token expires within 5 minutes, it refreshes automatically via `POST https://api.getjobber.com/api/oauth/token`.

Refreshed tokens are persisted back to the token file at `JOBBER_TOKEN_PATH` and the `JOBBER_ACCESS_TOKEN` value in `kc/.env` is updated. If the refresh token itself is expired, a clear error is thrown with a re-authorization URL.

If a Jobber API call returns an auth error (HTTP 401/403 or GraphQL auth-like errors), the adapter refreshes the token once and retries the call once before failing.

Queries paid invoices updated within the lookback window using cursor-based pagination. Each invoice is normalized to one record per job number (`jobs.nodes[].jobNumber`). Invoices with missing job numbers are skipped.

Amount uses `amounts.paymentsTotal` when available, falling back to `amounts.total`. Paid date comes from `receivedDate`.

## Constraints

- **No HeyPros mutations** — read-only
- Sheets write uses `gog` CLI (must be installed and authenticated)
