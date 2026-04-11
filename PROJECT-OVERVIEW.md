# KC PP Sync — Project Overview

## Goal
Automate KC Power Clean's cross-system operations by syncing data between **Jobber** (job management, invoicing, payments) and **HeyPros** (subcontractor dispatch, sub-invoices), with **Google Sheets** as the output layer and **Google Cloud** as the production host.

## The Problem
Nathan manually tracks subcontractor invoices across two disconnected platforms. When a client pays on Jobber, someone has to cross-reference HeyPros and maintain a spreadsheet with 40+ columns per row. At 150-200 jobs/month, this doesn't scale.

## The Solution
A scheduled Cloud Run service that:
1. Pulls job and invoice data from **Jobber** by month
2. Matches work orders from **HeyPros** to Jobber jobs via Job # = WO# (`purchaseOrder`), including multi-value PO fields
3. Pulls sub-invoice data from HeyPros (invoice #, amount, status, PDF link)
4. Writes structured rows to **Google Sheets** — one row per HeyPros WO
5. Computes **per-row margin %** from revenue and subcontractor costs
6. Maintains a payment Dashboard, profitability Dashboard, GTP $ output tabs, and sync Command log
7. Refreshes automatically every hour via Cloud Scheduler

## Systems Connected

| System | Access | What We Pull |
|---|---|---|
| **Jobber** | GraphQL API, OAuth 2.0 (Secret Manager) | Jobs, invoices, payment status, amounts, client names |
| **HeyPros** | GraphQL API, email/password auth | Work orders, sub-invoices, contractor info, PDF links |
| **Google Sheets** | Sheets API (ADC via Cloud Run SA) | Output target — all sync writes go here |
| **Google Cloud** | Cloud Run + Scheduler + Secret Manager | Execution, scheduling, credential storage |

## Current State (as of 2026-04-10)

### ✅ Live in Production
- Cloud Run service `kc-pp-sync` (revision kc-pp-sync-00091-zxv, 512 MiB)
- 4 Cloud Scheduler jobs: current, current-r, prev, prev-r (staggered hourly)
- **Three layout system:** new 40-column (March+), legacy 27-column (Feb), recurring 26-column (no margin col)
- Per-row **margin % column (C)** on one-off tabs with 10-band gradient CF
- Margin calculation: payment-gated, multi-contractor aware, weighted C1 header
- Recurring tabs: `March - R`, `April - R`, `Feb - R` (manual Job# input, auto-populated)
- Multi-invoice tracker (cols Z–AN): 5 invoice slots per row with amount + paid status
- Multi-value HeyPros purchaseOrder parsing (space-separated, slash-shorthand)
- GTP $ tabs: filtered output per month merging one-off + recurring rows
- Dashboard tab: payment status aggregation by month (Feb–present) with 10-band gradient CF
- Profitability dashboard: 3-way split (One-off/Recurring/Total), revenue/labor gated on paid status
- Command tab: full sync result log
- Auto Notes: 11 conditions including margin breakdown for multi-contractor jobs
- Manual sync via Apps Script sidebar (KC Sync menu in spreadsheet)
- Jobber OAuth token auto-rotation via Secret Manager
- 61 tests passing, 5,315 lines TypeScript

### 📊 Data Volume
- 488 total jobs tracked across February–April
- February: 148 jobs, 74.6% margin
- March: 193 jobs (one-off) + 27 recurring, 67.5% margin
- April: 72 jobs (one-off) + 10 recurring, 70.5% margin

### 📋 Deferred / Open
- HeyPros label mutations (`jobLabelAttach "PAID BY CLIENT"`) — deferred until Nathan approves writes
- No "prev-prev" scheduler mode (can only sync current/previous month via scheduler)

### 🔒 Constraints
- HeyPros: read-only until Nathan approves mutations
- HeyPros: max 1 signIn per 15 min, 250ms between queries
- GCloud free tier — minimal overage (~$0.20/month for scheduler)
- No Claude Code dependency for ops — all tool operations via HQ directly

## Architecture

```
Cloud Scheduler (4 jobs, hourly staggered)
  → Cloud Run: kc-pp-sync (us-central1, aya-gservicies)
    → Secret Manager: read Jobber tokens, HeyPros creds, sheet ID
    → Jobber GraphQL: fetch all jobs + invoices for target month
    → HeyPros GraphQL: fetch all WOs, match by purchaseOrder = Job#
    → Google Sheets API: write rows, compute margins, refresh GTP tab,
       refresh Dashboard + Profitability, write CF rules
    → Secret Manager: write rotated Jobber token (if refreshed)
    → Command tab: log sync result
```

## Spreadsheet Structure

**KC PP Sync** — `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`

| Tab | Type | Cols | Notes |
|---|---|---|---|
| `February` | Legacy one-off | 27 | Margin col C inserted, renamed from `February 2026` |
| `March`, `April`… | New one-off | 40 | Margin col C + invoice tracker Z–AN |
| `Feb - R`, `March - R`, `April - R` | Recurring | 26 | No margin col, manual Job# + Invoice# |
| `March - GTP $`, `April - GTP $`… | GTP output | 9 | Filtered unpaid Good-to-Pay rows |
| `Dashboard` | Aggregation | 15 + profitability | Payment status + margin by month |
| `Command` | Sync log | 8 | Every sync result appended |

## Key Files
- `src/function.ts` — Cloud Run handler, mode routing, orchestration, margin calculation
- `src/adapters/jobber.ts` — Jobber GraphQL with OAuth + Secret Manager token rotation
- `src/adapters/heypros.ts` — HeyPros GraphQL with token caching + rate protection
- `src/adapters/sheets.ts` — All Sheets read/write: sync, GTP, Dashboard, Profitability, CF, Command log
- `src/config/constants.ts` — Layout column maps (40-col new, 27-col legacy), header definitions
- `src/config/env.ts` — Environment config, Secret Manager, mode resolution
- `src/config/types.ts` — Shared TypeScript interfaces
- `apps-script/sync-button.gs` — Google Apps Script sidebar (manual sync trigger)
- `test/output-sheet.test.ts` — 61 unit tests

## API Authority

### HeyPros API
- 197 types, ~317 WOs, ~30-60 new/month
- WO# is NOT unique (duplicate WO 19699 confirmed)
- `purchaseOrder` can be multi-value (space-separated, slash-shorthand)
- `jobsDashboard` does NOT return Closed/Paid WOs
- Amounts in cents — divide by 100
- Token TTL = 60 min, signIn rate limit = 1 per 15 min

### Jobber API
- OAuth 2.0, tokens in Secret Manager, auto-rotated on refresh
- `searchTerm` is fuzzy — always exact-filter client-side
- `receivedDate` = paid date

### Google Cloud
- Project: `aya-gservicies`
- Auth: ADC via Cloud Run service account `823212137840-compute@developer.gserviceaccount.com`
- Secrets: `jobber-tokens`, `heypros-credentials`, `spreadsheet-id`
