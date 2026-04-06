# KC PP Sync — Project Overview

## Goal
Automate KC Power Clean's cross-system operations by syncing data between **Jobber** (job management, invoicing, payments) and **HeyPros** (subcontractor dispatch, sub-invoices), with **Google Sheets** as the output layer and **Google Cloud** as the production host.

## The Problem
Nathan manually tracks subcontractor invoices across two disconnected platforms. When a client pays on Jobber, someone has to cross-reference HeyPros and maintain a spreadsheet with 39+ columns per row. At 150-200 jobs/month, this doesn't scale.

## The Solution
A scheduled Cloud Run service that:
1. Pulls job and invoice data from **Jobber** by month
2. Matches work orders from **HeyPros** to Jobber jobs via Job # = WO# (`purchaseOrder`)
3. Pulls sub-invoice data from HeyPros (invoice #, amount, status, PDF link)
4. Writes structured rows to **Google Sheets** — one row per HeyPros WO
5. Maintains a payment Dashboard, GTP $ output tabs, and sync Command log
6. Refreshes automatically every hour via Cloud Scheduler

## Systems Connected

| System | Access | What We Pull |
|---|---|---|
| **Jobber** | GraphQL API, OAuth 2.0 (Secret Manager) | Jobs, invoices, payment status, amounts, client names |
| **HeyPros** | GraphQL API, email/password auth | Work orders, sub-invoices, contractor info, PDF links |
| **Google Sheets** | Sheets API (ADC via Cloud Run SA) | Output target — all sync writes go here |
| **Google Cloud** | Cloud Run + Scheduler + Secret Manager | Execution, scheduling, credential storage |

## Current State (as of 2026-04-06)

### ✅ Live in Production
- Cloud Run service `kc-pp-sync` (revision kc-pp-sync-00053-hg4, 512 MiB)
- 4 Cloud Scheduler jobs: current, current-r, prev, prev-r (staggered hourly)
- Dual layout system: new 39-column layout (March+) + legacy 26-column (Jan/Feb)
- Recurring tabs: `March - R`, `April - R`, `Feb - R` (manual Job# input, auto-populated)
- Multi-invoice tracker (cols Y–AM): 5 invoice slots per row with amount + paid status
- GTP $ tabs: filtered output per month for unpaid Good-to-Pay rows
- Dashboard tab: payment status aggregation by month (Feb–present), YTD totals
- Profitability dashboard: revenue, labor, gross profit, margin % by month with color coding
- Command tab: full sync result log (every invocation appended)
- Auto Notes: 12 conditions, rebuilt every sync
- Manual sync via Apps Script sidebar (KC Sync menu in spreadsheet)
- Jobber OAuth token auto-rotation via Secret Manager
- 43 tests passing

### 📋 Deferred / Open
- Remaining Balance column (Sub Invoice Amount − KCPC Released Amount) — Nathan paused pending scope clarification
- HeyPros label mutations (`jobLabelAttach "PAID BY CLIENT"`) — deferred until Nathan approves writes
- Phase 3 gate for manual sync button: IAM grant + install in spreadsheet not yet verified
- May rollover: auto-derives correctly from date, verify May 1

### 🔒 Constraints
- HeyPros: read-only until Nathan approves mutations
- HeyPros: max 1 signIn per 15 min, 250ms between queries
- GCloud free tier — $0/month target
- No Claude Code dependency for ops — all tool operations via HQ directly

## Architecture

```
Cloud Scheduler (4 jobs, hourly staggered)
  → Cloud Run: kc-pp-sync (us-central1, aya-gservicies)
    → Secret Manager: read Jobber tokens, HeyPros creds, sheet ID
    → Jobber GraphQL: fetch all jobs + invoices for target month
    → HeyPros GraphQL: fetch all WOs, match by purchaseOrder = Job#
    → Google Sheets API: write rows, refresh GTP tab, refresh Dashboard
    → Secret Manager: write rotated Jobber token (if refreshed)
    → Command tab: log sync result
    → Telegram (on failure): alert to AYA MC
```

## Spreadsheet Structure

**KC PP Sync** — `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`

| Tab | Type | Notes |
|---|---|---|
| `February 2026` | Legacy one-off | 26-col layout |
| `March`, `April`… | New one-off | 39-col layout with invoice tracker |
| `Feb - R`, `March - R`, `April - R` | Recurring | 26-col layout, manual Job#+Invoice# |
| `March - GTP $`, `April - GTP $`… | GTP output | Filtered unpaid Good-to-Pay rows |
| `Dashboard` | Aggregation | Payment status + profitability by month |
| `Command` | Sync log | Every sync result appended |

## Key Files
- `src/function.ts` — Cloud Run handler, mode routing, orchestration
- `src/adapters/jobber.ts` — Jobber GraphQL with OAuth + Secret Manager token rotation
- `src/adapters/heypros.ts` — HeyPros GraphQL with token caching + rate protection
- `src/adapters/sheets.ts` — All Sheets read/write: sync, GTP, Dashboard, Profitability, Command log
- `src/config/constants.ts` — Layout column maps, tab lists, header definitions
- `src/config/types.ts` — Shared TypeScript interfaces
- `apps-script/sync-button.gs` — Google Apps Script sidebar (manual sync trigger)
- `test/output-sheet.test.ts` — 43 unit tests

## API Authority

### HeyPros API
Canonical reference in `references/HEYPROS-API-AUTHORITY.md` and linked project docs.
Key facts:
- 197 types, ~317 WOs, ~30-60 new/month
- WO# is NOT unique (duplicate WO 19699 confirmed)
- `jobsDashboard` does NOT return Closed/Paid WOs
- Amounts in cents — divide by 100
- Token TTL = 60 min, signIn rate limit = 1 per 15 min

### Jobber API
Lives in `src/adapters/jobber.ts` and `references/jobber-schema/`.
- OAuth 2.0, tokens in Secret Manager, auto-rotated on refresh
- `searchTerm` is fuzzy — always exact-filter client-side
- `receivedDate` = paid date

### Google Cloud
- Project: `aya-gservicies`
- Auth: ADC via Cloud Run service account `823212137840-compute@developer.gserviceaccount.com`
- Secrets: `jobber-tokens`, `heypros-credentials`, `spreadsheet-id`
