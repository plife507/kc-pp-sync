# CLAUDE.md — KC PP Sync

Last updated: 2026-04-10 (v3.1 — margin column + recurring GTP fix)

## Purpose
KC PP Sync is a **Google Cloud Run** service that syncs job and payment data from Jobber + HeyPros APIs into a Google Sheet for KC Power Clean's subcontractor payment operations. Deployed to Cloud Run, triggered hourly via Cloud Scheduler. 61 tests passing.

## Architecture

```
src/
  function.ts          Cloud Run HTTP handler + mode routing + sync orchestration
  adapters/
    jobber.ts          Jobber GraphQL adapter (OAuth, Secret Manager token rotation, throttle)
    heypros.ts         HeyPros GraphQL adapter (auth, token cache, job queries)
    sheets.ts          Google Sheets adapter (read/write, layout detection, GTP refresh,
                         Dashboard aggregation, Profitability Dashboard, Command log,
                         margin CF, column formatting)
  config/
    constants.ts       HEADER_ROW arrays (new 40-col, legacy 27-col), layout column maps
    env.ts             Environment config + Secret Manager integration + mode resolution
    types.ts           Shared interfaces (HeyProsJobDetail, JobberPaidJob)

test/
  output-sheet.test.ts Auto-column, multi-invoice, auto-notes, round-robin, margin tests (61 tests)

dist/                  Compiled output (tracked in git, gcp-build is no-op)
apps-script/           Google Apps Script files (sidebar sync button, vip-email-to-slack)
references/            Jobber schema docs, HeyPros API reference links
```

## Commands
```bash
npm test          # Run all tests (tsx --test) — 61 passing
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

## Three Layout Types

### ⚠️ CRITICAL: Column Index Differences

The codebase has THREE different column layouts. Margin column C was inserted into one-off tabs only. Recurring tabs were NOT modified. This means:

| Layout | Cols | Margin col C? | Company | PP Owner | Job # | Sub Inv Amt | Payment Status | Payment Tracking |
|---|---|---|---|---|---|---|---|---|
| **New one-off** (Mar+) | 40 (A–AN) | ✅ Yes | D(3) | E(4) | G(6) | Q(16) | T(19) | U(20) |
| **Legacy one-off** (Feb) | 27 (A–AA) | ✅ Yes | D(3) | E(4) | G(6) | S(18) | V(21) | W(22) |
| **Recurring** (all -R tabs) | 26 (A–Z) | ❌ No | C(2) | D(3) | F(5) | R(17) | U(20) | V(21) |

Every function that reads columns must branch on all three cases. Key functions:
- `getDashboardColIndices()` — returns correct indices per layout type
- `extractGtpRows()` — takes `recurring` parameter for output column mapping
- `refreshProfitabilityDashboard()` — hardcoded indices per section (correct)

| Tab naming | Layout | Columns | Notes |
|---|---|---|---|
| `March`, `April`… (no year) | New one-off | 40 cols A–AN | Margin col C + 5-slot invoice tracker Z–AN |
| `February` (renamed from `February 2026`) | Legacy one-off | 27 cols A–AA | Margin col C inserted, single invoice per row |
| Ends with ` - R` | Recurring | 26 cols A–Z | NO margin col C. Manual: A (Date), L (Invoice #) |
| Ends with ` - GTP $` | GTP output | 9 cols | Not synced directly |
| `Dashboard` | Dashboard | 15 + profitability cols | Auto-refreshed after sync |
| `Command` | Sync log | 8 cols | Appended after every sync |

Detection: `isNewLayout(tabName)` — tabs without year suffix AND not in legacy list = new layout.

## New Layout (March+): A–AN (40 columns)

| Col | Idx | Header | Mode |
|-----|-----|--------|------|
| A | 0 | Date | Auto |
| B | 1 | REVIEW | Manual |
| C | 2 | [A] Margin % | Auto (computed) |
| D | 3 | Company Name | Auto |
| E | 4 | PP Owner Name | Auto |
| F | 5 | HeyPros ID # | Auto (HYPERLINK) |
| G | 6 | Job # | Manual — drives the sync |
| H | 7 | Jobber Link | Auto (HYPERLINK) |
| I | 8 | Job Status | Auto |
| J | 9 | Job Type | Auto |
| K | 10 | Client Name | Auto (HYPERLINK) |
| L | 11 | Division | Auto |
| M | 12 | # of Invoices | Auto |
| N | 13 | Total Invoiced | Auto (currency) |
| O | 14 | All Paid? | Auto (✅/❌) |
| P | 15 | HeyPros Invoice # | Auto |
| Q | 16 | Sub Invoice Amount | Auto |
| R | 17 | KCPC Released Amount | **Manual** |
| S | 18 | Contractor Invoice PDF | Auto (HYPERLINK) |
| T | 19 | Payment Status | **Manual** dropdown |
| U | 20 | Payment Tracking | **Manual** dropdown |
| V | 21 | Payment Method | **Manual** dropdown |
| W | 22 | Date of Payment | **Manual** |
| X | 23 | Notes / Remarks | **Manual** |
| Y | 24 | Auto Notes | Auto (rebuilt every sync) |
| Z–AN | 25–39 | Invoice Tracker | Auto (5 slots × 3 cols) |

**Manual columns (NEVER auto-written): B, G, R, T, U, V, W, X**

### Invoice Tracker Block (Z–AN)

| Slot | Invoice # | Amount | Paid? |
|------|-----------|--------|-------|
| 1 | Z | AA | AB |
| 2 | AC | AD | AE |
| 3 | AF | AG | AH |
| 4 | AI | AJ | AK |
| 5 | AL | AM | AN |

## Legacy Layout (February): A–AA (27 columns)

Same as new layout structure but with legacy column names (Invoice Number instead of # of Invoices, Invoice Status instead of All Paid?, etc). Margin column C was inserted here too, shifting everything +1 from the original 26-col layout.

| Col | Idx | Header | Mode |
|-----|-----|--------|------|
| A–C | 0–2 | Date, Review, Margin % | Same as new |
| D–G | 3–6 | Company, PP Owner, HeyPros ID, Job # | Same as new |
| H–L | 7–11 | Jobber Link, Job Status, Job Type, Client Name, Division | Same as new |
| M | 12 | Invoice Number | Auto (HYPERLINK) — `"-"` = manual hold |
| N | 13 | Total Invoiced | Auto |
| O | 14 | Invoice Issued Date | Auto |
| P | 15 | Jobber Invoice Status | Auto |
| Q | 16 | Date Invoice Paid | Auto |
| R | 17 | HeyPros Invoice # | Auto |
| S | 18 | Sub Invoice Amount | Auto |
| T | 19 | KCPC Released Amount | Manual |
| U | 20 | Contractor Invoice PDF | Auto |
| V | 21 | Payment Status | Manual |
| W | 22 | Payment Tracking | Manual |
| X | 23 | Payment Method | Manual |
| Y | 24 | Date of Payment | Manual |
| Z | 25 | Notes / Remarks | Manual |
| AA | 26 | Auto Notes | Auto |

## Recurring Tab Layout: A–Z (26 columns, NO margin column)

⚠️ This layout does NOT have margin column C. All indices are -1 compared to legacy one-off.

| Col | Idx | Header | Mode |
|-----|-----|--------|------|
| A | 0 | Date | Auto (from HeyPros installationStarts) |
| B | 1 | REVIEW | Manual |
| C | 2 | Company Name | Auto |
| D | 3 | PP Owner Name | Auto |
| E | 4 | HeyPros ID # | Auto |
| F | 5 | Job # | **Manual** — drives the sync |
| G | 6 | Jobber Link | Auto |
| H | 7 | Job Status | Auto |
| I | 8 | Job Type | Auto |
| J | 9 | Client Name | Auto |
| K | 10 | Division | Auto |
| L | 11 | Invoice Number | **Manual** (three-state) |
| M | 12 | Total Invoiced | Auto |
| N | 13 | Invoice Issued Date | Auto |
| O | 14 | Jobber Invoice Status | Auto |
| P | 15 | Date Invoice Paid | Auto |
| Q | 16 | HeyPros Invoice # | Auto |
| R | 17 | Sub Invoice Amount | Auto |
| S | 18 | KCPC Released Amount | Manual |
| T | 19 | Contractor Invoice PDF | Auto |
| U | 20 | Payment Status | Manual |
| V | 21 | Payment Tracking | Manual |
| W | 22 | Payment Method | Manual |
| X | 23 | Date of Payment | Manual |
| Y | 24 | Notes / Remarks | Manual |
| Z | 25 | Auto Notes | Auto |

### Recurring Tab Rules
- Manual input: **Job #** (col F) and **Invoice #** (col L) only
- WOs assigned round-robin per job number, sorted by `installationStarts` ascending
- Invoice # three-state: blank → auto-populate | `"-"` → skip invoice sync | number → look up specific invoice

## Margin Column (C)

**Formula:** `(Total Invoiced − SUM of all Sub Invoice Amounts for same Job#) / Total Invoiced`

| Condition | Value |
|-----------|-------|
| Paid (✅ or Invoice Status = "Paid") | XX.X% |
| Unpaid / not yet invoiced | Blank |
| Hybrid division | Blank |
| Zero Total Invoiced | Blank |
| Multi-contractor job | Same margin on all rows + auto note |

**C1 header:** Weighted average margin from Dashboard (not simple average of rows).

**CF:** 10-band gradient (deep green ≥90% → deep red <10%, 0% excluded).

**NOT on recurring tabs.** Recurring tabs have no column C insert.

## GTP $ Tab

Filters monthly tab + corresponding recurring tab for unpaid GTP rows.

**Eligibility:** All Paid? = ✅ AND Payment Status = "Good to Pay" AND Payment Tracking = "AWAITING FOR PAYMENT"

**Column indices differ by layout:**
- New layout: O(14), Q(16), T(19), U(20)
- Legacy one-off (Feb, with margin col C): P(15), S(18), V(21), W(22)
- Recurring (no margin col C): O(14), R(17), U(20), V(21)

Output columns: Date, Company Name, PP Owner, Job #, Client Name, Sub Invoice Amount, All Paid?, Payment Status, Payment Tracking

## Dashboard Tab

Auto-refreshed after every sync. Two sections:

**Payment Status section (rows 1–14):** 15 columns — Month | Total Jobs | Total $ | # Paid | % Paid | # Good to Pay | % GTP | # On Hold | % On Hold | # Pending Approval | % PA | # No Client Pay | % NCP | # Blank | % Blank. Recurring rows merged into same month. January excluded. YTD in row 14. CF: 10-band gradient on % Paid column.

**Profitability section (rows 18+):** Revenue, Labor, Gross Profit, Margin % by month with 3-way split (One-off/Recurring/Total). Hybrid visible but excluded from totals.

Revenue/Labor gate: only counted when client has paid (AllPaid=✅ for new, InvoiceStatus="Paid" for legacy/recurring).

Revenue dedup: Job# for new layout, Invoice# for legacy/recurring.

CF: 10-band gradient on all margin columns. 0% excluded from coloring.

## Command Tab (Sync Log)
Every sync appends: Timestamp | Tab | Status | Jobs | Rows | GTP Rows | Elapsed | Error

## Auto Notes (col Y new, AA legacy, Z recurring)

| Condition | Note |
|-----------|------|
| 2+ accepted HP invoices | ℹ️ N accepted invoices |
| Rejected/Canceled/Pending invoice | ⚠️/⏳ status: $X |
| No HeyPros match | ⚠️ WO# not found in HeyPros |
| Multi-contractor | ℹ️ Multi-contractor job (N WOs) |
| No Jobber data | ⚠️ Job# not found in Jobber |
| Extra row (no WO) | ⚠️ No HeyPros WO for this row |
| Shared invoice | 🔗 Shared Invoice #X (also on row N) |
| >5 invoices | ⚠️ Job has N invoices — only first 5 shown |
| Partial payment | 🔴 N of M client invoices unpaid |
| Multi-contractor margin | 📊 Job margin XX.X% — N subs: $A + $B = $total / $invoiced |

## Key Technical Details

- HeyPros amounts are in **CENTS** — divide by 100
- HeyPros hashidNumeric displayed dashed: `9331562` → `9-331-562`
- HeyPros job URL: `https://kc-power-clean.heypros.com/job/{hashid}`
- HeyPros purchaseOrder can be multi-value: space-separated ("19616 19659") or slash-shorthand ("19353 / 54"). Parsed by `parsePurchaseOrder()`.
- Jobber `searchTerm` is fuzzy — always filter exact match client-side
- Jobber `receivedDate` = paid date (no `paidDate` field)
- All sheet writes use `USER_ENTERED` (required for HYPERLINK formulas)
- Dates formatted as M/D/YYYY using UTC
- HeyPros signIn rate limit: max 1 attempt per 15 min, tokens last 60 min
- Jobber tokens auto-rotate via Secret Manager after each refresh
- `gcp-build` script must remain `"true"` (no-op) — dist/ is pre-committed

## Gotchas

- **Three different column layouts** — recurring tabs have NO margin column C, indices differ from both new and legacy one-off. Every column-reading function must branch on all three.
- HeyPros WO# (`purchaseOrder`) is NOT unique — multiple WOs can share one Job#
- HeyPros `purchaseOrder` can contain multiple job numbers (space/slash separated)
- HeyPros `jobsDashboard` does NOT return Closed/Paid WOs
- HeyPros introspection is disabled
- `gcp-build` must stay no-op — do not change
- `isNewLayout()` is the single source of truth for layout detection — do NOT add separate regex checks
- This is Cloud Run, not Cloud Functions — `gcloud run deploy`, not `gcloud functions deploy`
- Dashboard CF rules require raw decimal cell values (not pre-formatted strings) for numeric conditions
- CF rule insertion order matters — use explicit `index` parameter or NUMBER_BETWEEN bands

## What NOT to Touch

- Manual columns: new (B, G, R, T, U, V, W, X) / legacy (B, G, T, V, W, X, Y, Z) / recurring (B, F, L, S, U, V, W, X, Y)
- Conditional formatting rules (40 per monthly tab, 10-band gradient on margin cols)
- Data validations (dropdowns on I, J, L, T, U, V for new; H, I, K, U, V, W for legacy)
- `gcp-build` script behavior
- Recurring tab column layout — NO margin column, do NOT insert

## Google Cloud

| Component | Details |
|---|---|
| Project | `aya-gservicies` |
| Region | `us-central1` |
| Service | `kc-pp-sync` |
| Latest revision | `kc-pp-sync-00091-zxv` |
| Memory | 512 MiB |
| CPU | 0.1666 vCPU |
| Auth | Requires identity token |
| Service account | `823212137840-compute@developer.gserviceaccount.com` |

### Cloud Scheduler (staggered to prevent contention)

| Job | Cron | Mode |
|---|---|---|
| `kc-pp-sync-hourly` | `0 * * * *` | `current` |
| `kc-pp-sync-recurring` | `5 * * * *` | `current-r` |
| `kc-pp-sync-prev-month` | `10 */4 * * *` | `prev` |
| `kc-pp-sync-prev-recurring` | `15 */4 * * *` | `prev-r` |

### Secrets (Secret Manager)

| Secret | Description |
|---|---|
| `jobber-tokens` | Jobber OAuth token JSON — auto-rotated on refresh |
| `heypros-credentials` | HeyPros email + password |
| `spreadsheet-id` | KC PP Sync sheet ID |
