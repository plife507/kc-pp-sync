# kc-pp-sync

Automated sync service for KC Power Clean. Pulls job and invoice data from Jobber and HeyPros, writes structured records to Google Sheets, and maintains a real-time payment dashboard.

## What it does

- Fetches all jobs for the current and previous month from Jobber + HeyPros
- Matches HeyPros work orders to Jobber jobs by WO# (`purchaseOrder`)
- Writes one row per HeyPros WO to the appropriate month tab in the KC PP Sync spreadsheet
- Auto-populates: job status, client name, division, invoice data, sub invoice amount, payment status, auto notes
- Maintains a **Dashboard** tab with payment status aggregates (Feb–present)
- Maintains **GTP $** tabs (Good to Pay output per month)
- Logs every sync result to the **Command** tab (timestamp, tab, status, job count, row count, elapsed)
- Refreshes Jobber OAuth tokens automatically via Secret Manager

## Sheet architecture

| Tab type | Example | Layout | Notes |
|---|---|---|---|
| One-off | `March`, `April` | 39 cols (A–AM) | 5-slot invoice tracker (Y–AM) |
| Recurring | `March - R`, `April - R` | 26 cols (A–Z) | Manual cols: A (Date), L (Invoice #) |
| GTP $ | `March - GTP $` | 9 cols | Merged one-off + recurring, filtered to unpaid GTP rows |
| Dashboard | `Dashboard` | 15 cols | Payment status by month, YTD totals |
| Command | `Command` | 8 cols | Sync result log |
| Legacy one-off | `February 2026` | 26 cols | Same structure as recurring layout |

## Deployment

Runs as a **Google Cloud Run** service (`kc-pp-sync`, project `aya-gservicies`, region `us-central1`).

Four **Cloud Scheduler** jobs trigger hourly syncs:

| Job | Schedule | Mode | Tab |
|---|---|---|---|
| `kc-pp-sync-hourly` | every hour :00 | `current` | Current month one-off |
| `kc-pp-sync-recurring` | every hour :05 | `current-r` | Current month recurring |
| `kc-pp-sync-prev-month` | every 4h :10 | `prev` | Previous month one-off |
| `kc-pp-sync-prev-recurring` | every 4h :15 | `prev-r` | Previous month recurring |

## Manual sync

### Apps Script sidebar (in-sheet)
Open the KC PP Sync spreadsheet → **KC Sync** menu → pick a sync target.

### Direct API call
```bash
TOKEN=$(gcloud auth print-identity-token)
curl -X POST https://kc-pp-sync-823212137840.us-central1.run.app \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode":"current"}'
```

**Mode values:** `current`, `current-r`, `prev`, `prev-r`

To sync a specific tab by name:
```bash
-d '{"tab":"February 2026"}'
```

## Sync modes

| Mode | Resolves to | Tab type |
|---|---|---|
| `current` | Current calendar month | One-off |
| `current-r` | Current month + ` - R` | Recurring |
| `prev` | Previous calendar month | One-off |
| `prev-r` | Previous month + ` - R` | Recurring |

Month names auto-derive from the current date — no manual updates needed on rollover.

## Tab detection logic

| Tab name pattern | Layout used |
|---|---|
| `February 2026` | Legacy one-off (26-col) |
| `March`, `April`, … | New one-off (39-col) |
| Ends with ` - R` | Recurring (26-col) |
| Ends with ` - GTP $` | Output only — not synced directly |
| `Dashboard`, `Command` | System tabs — not synced |

## Recurring tab rules

- Manual input: **Job #** (col F) and **Invoice #** (col L) only
- All other fields auto-populated from Jobber + HeyPros
- WOs assigned round-robin per job number, sorted by `installationStarts` ascending
- Invoice # three-state logic:
  - **Blank** → auto-populate from Jobber
  - **`-`** → skip invoice sync (manual control mode, multi-invoice job)
  - **Invoice #** → look up that specific invoice, fill payment columns

## Multi-invoice jobs

Jobs with multiple Jobber invoices (e.g. multi-contractor or phased work) use the tracker block in cols Y–AM (one-off tabs only): up to 5 invoice slots, each with Invoice #, Amount, and Paid status. Column L holds the primary invoice; column M holds total invoiced across all invoices.

## Auto Notes

Auto-populated in col X (one-off) / col Z (legacy/recurring). Flags:
- No HeyPros WO found
- Invoice missing or unpaid
- Client paid but sub not released
- Payment method or tracking missing
- Multi-WO job
- Recurring job with no invoice

## Google Cloud integration

The service runs entirely on Google Cloud free tier infrastructure under project **`aya-gservicies`**.

### Cloud Run

The sync function is deployed as a containerized HTTP service:

| Property | Value |
|---|---|
| Service | `kc-pp-sync` |
| Region | `us-central1` |
| Latest revision | `kc-pp-sync-00053-hg4` |
| Memory | 512 MiB |
| CPU | 0.1666 vCPU |
| Auth | Requires identity token (not public) |
| Service account | `823212137840-compute@developer.gserviceaccount.com` |

Cloud Run builds directly from source via `gcloud run deploy --source .` — no manual Docker builds required.

### Cloud Scheduler

Four jobs trigger the service on a staggered schedule (UTC) to avoid contention:

| Job | Cron | Mode | Description |
|---|---|---|---|
| `kc-pp-sync-hourly` | `0 * * * *` | `current` | Current month one-off, every hour at :00 |
| `kc-pp-sync-recurring` | `5 * * * *` | `current-r` | Current month recurring, every hour at :05 |
| `kc-pp-sync-prev-month` | `10 */4 * * *` | `prev` | Previous month one-off, every 4h at :10 |
| `kc-pp-sync-prev-recurring` | `15 */4 * * *` | `prev-r` | Previous month recurring, every 4h at :15 |

Scheduler authenticates to Cloud Run using OIDC tokens issued to the service account.

### Secret Manager

OAuth tokens and credentials are stored as Secret Manager secrets (never in env vars or code):

| Secret | Description |
|---|---|
| `jobber-tokens` | Jobber OAuth token JSON — auto-rotated by the service after each token refresh |
| `heypros-credentials` | HeyPros login credentials |
| `spreadsheet-id` | Target Google Sheet ID |

The service reads secrets at runtime via the Secret Manager REST API using the Cloud Run service account's default credentials. Jobber token rotation writes the updated token back to Secret Manager immediately after each refresh so all future invocations use the latest token.

### Google Sheets

Data is written to the KC PP Sync spreadsheet via the **Google Sheets API** (googleapis Node.js client), authenticated using Application Default Credentials (ADC) inherited from the Cloud Run service account. The service account has been granted Editor access to the target spreadsheet.

### Cost

The entire stack runs within GCP free tier limits:
- Cloud Run: free tier covers ~2M requests/month; this service runs ~700 invocations/month
- Cloud Scheduler: 3 free jobs/month per project; we use 4 (minimal overage ~$0.10/month)
- Secret Manager: free tier covers 6 active secret versions and 10K access operations/month
- No persistent storage, no VPC, no load balancer

## Local development

```bash
cd projects/kc-pp-sync
npm install
npm run build
npm test          # 43 tests
```

Deploy to Cloud Run:
```bash
gcloud run deploy kc-pp-sync \
  --source . \
  --region us-central1 \
  --project aya-gservicies \
  --no-allow-unauthenticated
```

## Architecture

```
src/
  config/
    env.ts              — env var loading + Secret Manager integration
    types.ts            — shared types and constants
  adapters/
    heypros.ts          — HeyPros GraphQL auth, token caching, paginated fetch
    jobber.ts           — Jobber GraphQL + OAuth auto-refresh via Secret Manager
    sheets.ts           — all Google Sheets read/write logic
      refreshDashboard()           — payment status aggregation
      refreshProfitabilityDashboard() — revenue & margin section (paused)
  core/
    matcher.ts          — WO↔job matching logic
  function.ts           — Cloud Run HTTP handler, mode routing, sync orchestration
test/
  matcher.test.ts       — matcher edge case tests
  sheets.test.ts        — sheet write/format tests
  function.test.ts      — handler integration tests
```

## Secrets

Stored in Google Secret Manager (`aya-gservicies`):

| Secret | Description |
|---|---|
| `jobber-tokens` | Jobber OAuth token JSON (auto-rotated on refresh) |
| `heypros-credentials` | HeyPros email + password |
| `spreadsheet-id` | KC PP Sync sheet ID |

## Spreadsheet

**KC PP Sync** — `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`
