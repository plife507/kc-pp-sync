# kc-pp-sync

**v3.1.0** · Automated sync service for KC Power Clean. Pulls job and invoice data from Jobber and HeyPros, writes structured records to Google Sheets, and maintains real-time payment + profitability dashboards.

## What it does

- Fetches all jobs for the current and previous month from Jobber + HeyPros
- Matches HeyPros work orders to Jobber jobs by WO# (`purchaseOrder`), including multi-value PO fields
- Writes one row per HeyPros WO to the appropriate month tab in the KC PP Sync spreadsheet
- Auto-populates: job status, client name, division, invoice data, sub invoice amount, payment status, **per-row margin %**, auto notes
- Maintains a **Dashboard** tab with payment status aggregates + profitability metrics (Feb–present)
- Maintains **GTP $** tabs (Good to Pay output per month, merging one-off + recurring)
- Computes **margin %** per row: `(Total Invoiced − Sub Invoice Amounts) / Total Invoiced`
- Logs every sync result to the **Command** tab
- Refreshes Jobber OAuth tokens automatically via Secret Manager

## Sheet architecture

| Tab type | Example | Layout | Cols | Notes |
|---|---|---|---|---|
| One-off (new) | `March`, `April` | New one-off | 40 (A–AN) | Margin col C, 5-slot invoice tracker Z–AN |
| One-off (legacy) | `February` | Legacy one-off | 27 (A–AA) | Margin col C inserted, single invoice |
| Recurring | `March - R`, `April - R` | Recurring | 26 (A–Z) | **No margin col C**. Manual: A, F, L |
| GTP $ | `March - GTP $` | GTP output | 9 | Merged one-off + recurring |
| Dashboard | `Dashboard` | Dashboard | 15 + profitability | Payment status + margin by month |
| Command | `Command` | Sync log | 8 | Every sync appended |

### ⚠️ Column layout warning

Recurring tabs do NOT have margin column C. This means all column indices on recurring tabs are offset by -1 compared to legacy one-off tabs. Code must branch on all three layouts (new / legacy / recurring).

## Deployment

Runs as a **Google Cloud Run** service (`kc-pp-sync`, project `aya-gservicies`, region `us-central1`).

**Current revision:** `kc-pp-sync-00091-zxv` (512 MiB, 0.1666 vCPU)

Four **Cloud Scheduler** jobs trigger hourly syncs:

| Job | Schedule | Mode | Tab |
|---|---|---|---|
| `kc-pp-sync-hourly` | every hour :00 | `current` | Current month one-off |
| `kc-pp-sync-recurring` | every hour :05 | `current-r` | Current month recurring |
| `kc-pp-sync-prev-month` | every 4h :10 | `prev` | Previous month one-off |
| `kc-pp-sync-prev-recurring` | every 4h :15 | `prev-r` | Previous month recurring |

**GTP $ tabs and Dashboard auto-refresh** at the end of every sync — no separate scheduler jobs needed.

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
-d '{"tab":"February"}'
```

## Margin calculation

**Per-row:** `(Total Invoiced − SUM of all Sub Invoice Amounts for same Job#) / Total Invoiced`

- Multi-contractor jobs: all rows for same Job# show identical combined margin
- Payment gate: only computed when client has paid (AllPaid=✅ or InvoiceStatus="Paid")
- Unpaid/uninvoiced/hybrid → blank
- C1 header shows weighted average margin from Dashboard
- 10-band gradient CF (deep green ≥90% → deep red <10%)
- **Not on recurring tabs** (no column C)

## Local development

```bash
cd projects/kc-pp-sync
npm install
npm run build
npm test          # 61 tests
```

Deploy:
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
  function.ts           — Cloud Run HTTP handler, mode routing, sync orchestration, margin calc
  adapters/
    heypros.ts          — HeyPros GraphQL auth, token caching, paginated fetch
    jobber.ts           — Jobber GraphQL + OAuth auto-refresh via Secret Manager
    sheets.ts           — All Sheets read/write: sync, GTP, Dashboard, Profitability, CF, Command log
  config/
    constants.ts        — Layout column maps, header definitions (40-col new, 27-col legacy)
    env.ts              — Environment config, Secret Manager, mode resolution
    types.ts            — Shared TypeScript interfaces
test/
  output-sheet.test.ts  — 61 tests: columns, margin, auto-notes, round-robin, PO parsing
```

## Spreadsheet

**KC PP Sync** — `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`
