# CLAUDE.md — KC PP Sync

Last updated: 2026-04-06 (v2.0 — production hardening complete)

## Purpose
KC PP Sync is a **Google Cloud Run** service that syncs job and payment data from Jobber + HeyPros APIs into a Google Sheet for KC Power Clean's subcontractor payment operations. Deployed to Cloud Run (not Cloud Functions), triggered hourly via Cloud Scheduler. 43 tests passing.

## Architecture

```
src/
  function.ts          Cloud Run HTTP handler + mode routing + sync orchestration
  adapters/
    jobber.ts          Jobber GraphQL adapter (OAuth, Secret Manager token rotation, throttle)
    heypros.ts         HeyPros GraphQL adapter (auth, token cache, job queries)
    sheets.ts          Google Sheets adapter (read/write, layout detection, GTP refresh,
                         Dashboard aggregation, Profitability Dashboard, Command log)
  config/
    constants.ts       HEADER_ROW, column layout maps (NEW_LAYOUT_COLS, LEGACY_LAYOUT_COLS)
    env.ts             Environment config + Secret Manager integration
    types.ts           Shared interfaces (HeyProsJobDetail, JobberPaidJob)

test/
  output-sheet.test.ts Auto-column, multi-invoice, auto-notes, round-robin tests (43 tests)

dist/                  Compiled output (tracked in git, gcp-build is no-op)
apps-script/           Google Apps Script files (sidebar sync button, vip-email-to-slack)
references/            Jobber schema docs, HeyPros API reference links
```

## Commands
```bash
npm test          # Run all tests (tsx --test) — 43 passing
npm run build     # TypeScript compile (dist/ must be committed)
npm run local     # Local functions-framework server
```

## Deploy
```bash
gcloud run deploy kc-pp-sync \
  --source . \
  --region us-central1 \
  --project aya-gservicies \
  --no-allow-unauthenticated
```
Do NOT use `gcloud functions deploy` — this is Cloud Run, not Cloud Functions.

## Sync Modes

The HTTP handler accepts `{"mode": "current|current-r|prev|prev-r"}` or `{"tab": "March"}`.

| Mode | Resolves to | Layout |
|---|---|---|
| `current` | Current calendar month (e.g., "April") | New one-off |
| `current-r` | Current month + " - R" (e.g., "April - R") | Recurring |
| `prev` | Previous calendar month (e.g., "March") | New or legacy one-off |
| `prev-r` | Previous month + " - R" (e.g., "March - R") | Recurring |

## Dual Layout System

| Tab naming | Layout | Columns | Notes |
|---|---|---|---|
| `March`, `April`… (no year) | New one-off | 39 cols A–AM | Multi-invoice tracker Y–AM |
| `February 2026`, `January 2026` | Legacy one-off | 26 cols A–Z | Single invoice per row |
| Ends with ` - R` | Recurring | 26 cols A–Z | Manual: A (Date), L (Invoice #) |
| Ends with ` - GTP $` | GTP output | 9 cols | Not synced directly |
| `Dashboard` | Dashboard | 15 + profitability cols | Auto-refreshed after sync |
| `Command` | Sync log | 8 cols | Appended after every sync |

Detection: `isNewLayout(tabName)` — no year suffix = new layout.

## New Layout (March+): A–AM (39 columns)

| Col | Header | Mode |
|-----|--------|------|
| A | Date | Auto |
| B | REVIEW | Manual |
| C | Company Name | Auto |
| D | PP Owner Name | Auto |
| E | HeyPros ID # | Auto (HYPERLINK) |
| F | Job # | Manual — drives the sync |
| G | Jobber Link | Auto (HYPERLINK) |
| H | Job Status | Auto |
| I | Job Type | Auto |
| J | Client Name | Auto (HYPERLINK) |
| K | Division | Auto |
| L | # of Invoices | Auto |
| M | Total Invoiced | Auto (currency) |
| N | All Paid? | Auto (✅/❌) |
| O | HeyPros Invoice # | Auto |
| P | Sub Invoice Amount | Auto |
| Q | KCPC Released Amount | **Manual** |
| R | Contractor Invoice PDF | Auto (HYPERLINK) |
| S | Payment Status | **Manual** dropdown |
| T | Payment Tracking | **Manual** dropdown |
| U | Payment Method | **Manual** dropdown |
| V | Date of Payment | **Manual** |
| W | Notes / Remarks | **Manual** |
| X | Auto Notes | Auto (rebuilt every sync) |
| Y–AM | Invoice Tracker | Auto (5 slots × 3 cols) |

**Manual columns (NEVER auto-written): B, F, Q, S, T, U, V, W**

### Invoice Tracker Block (Y–AM)

| Slot | Invoice # | Amount | Paid? |
|------|-----------|--------|-------|
| 1 | Y | Z | AA |
| 2 | AB | AC | AD |
| 3 | AE | AF | AG |
| 4 | AH | AI | AJ |
| 5 | AK | AL | AM |

## Legacy Layout (Jan/Feb 2026): A–Z (26 columns)

| Col | Header | Mode |
|-----|--------|------|
| A–K | Same as new | Same |
| L | Invoice Number | Auto (HYPERLINK) — `"-"` = manual hold |
| M | Invoice Total | Auto |
| N | Invoice Issued Date | Auto |
| O | Invoice Status | Auto |
| P | Date Invoice Paid | Auto |
| Q | HeyPros Invoice # | Auto |
| R | Sub Invoice Amount | Auto |
| S | KCPC Released Amount | Manual |
| T | Contractor Invoice PDF | Auto |
| U | Payment Status | Manual |
| V | Payment Tracking | Manual |
| W | Payment Method | Manual |
| X | Date of Payment | Manual |
| Y | Notes / Remarks | Manual |
| Z | Auto Notes | Auto |

## Recurring Tab Rules
- Manual input: **Job #** (col F) and **Invoice #** (col L) only
- WOs assigned round-robin per job number, sorted by `installationStarts` ascending
- Invoice # three-state: blank → auto-populate | `"-"` → skip invoice sync | number → look up specific invoice

## GTP $ Tab
Filters monthly tab for unpaid GTP rows:
- New layout: N = ✅, S = "Good to Pay", T = "AWAITING FOR PAYMENT"
- Legacy: O = "Paid"/✅, U = "Good to Pay", V = "AWAITING FOR PAYMENT"

Output columns: Date, Company Name, PP Owner, Job #, Sub Invoice Amount, All Paid?, Payment Status, Payment Tracking, Client Name

## Dashboard Tab
Auto-refreshed after every sync. Two sections:

**Payment Status section (rows 1–17):** 15 columns — Month | Total Jobs | Total $ | # Paid | % Paid | # Good to Pay | % GTP | # On Hold | % On Hold | # Pending Approval | % PA | # No Client Pay | % NCP | # Blank | % Blank. Recurring rows merged into same month. January excluded. YTD in row 14.

**Profitability section (rows 18+):** Revenue, Labor, Gross Profit, Margin % by month. Dedup logic: new one-off by Job#, legacy by Invoice#, recurring by Invoice# when populated. Margin color-coded (green ≥65%, yellow 40–65%, red <40%).

## Command Tab (Sync Log)
Every sync appends: Timestamp | Tab | Status | Jobs | Rows | GTP Rows | Elapsed | Error

## Auto Notes (col X for new, Z for legacy)

| Condition | Note |
|-----------|------|
| 2+ accepted HP invoices | ℹ️ N accepted invoices |
| Rejected invoice | ⚠️ Rejected: $X |
| Canceled invoice | ⚠️ Canceled: $X |
| Pending invoice | ⏳ Pending: $X |
| No HeyPros match | ⚠️ WO# not found in HeyPros |
| Multi-contractor | ℹ️ Multi-contractor job (N WOs) |
| No Jobber data | ⚠️ Job# not found in Jobber |
| Extra row (no WO) | ⚠️ No HeyPros WO for this row |
| Shared invoice | 🔗 Shared Invoice #X (also on row N) |
| >5 invoices | ⚠️ Job has N invoices — only first 5 shown |
| Partial payment | 🔴 N of M client invoices unpaid |

## Key Technical Details

- HeyPros amounts are in **CENTS** — divide by 100
- HeyPros hashidNumeric displayed dashed: `9331562` → `9-331-562`
- HeyPros job URL: `https://kc-power-clean.heypros.com/job/{hashid}`
- Jobber `searchTerm` is fuzzy — always filter exact match client-side
- Jobber `receivedDate` = paid date (no `paidDate` field)
- All sheet writes use `USER_ENTERED` (required for HYPERLINK formulas)
- Dates formatted as M/D/YYYY using UTC
- HeyPros signIn rate limit: max 1 attempt per 15 min, tokens last 60 min
- Jobber tokens auto-rotate via Secret Manager after each refresh
- `gcp-build` script must remain `"true"` (no-op) — dist/ is pre-committed

## Gotchas

- HeyPros WO# (`purchaseOrder`) is NOT unique — multiple WOs can share one Job#
- HeyPros `jobsDashboard` does NOT return Closed/Paid WOs
- HeyPros introspection is disabled
- `gcp-build` must stay no-op — do not change
- Legacy tabs (Jan/Feb) have different column positions — all code must branch on `isNewLayout()`
- This is Cloud Run, not Cloud Functions — `gcloud run deploy`, not `gcloud functions deploy`

## What NOT to Touch

- Manual columns: new layout (B, F, Q, S, T, U, V, W) / legacy (B, F, S, U, V, W, X, Y)
- Conditional formatting rules (40 per monthly tab)
- Data validations (dropdowns on H, I, K, S, T, U)
- `gcp-build` script behavior
