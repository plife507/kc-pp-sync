# CLAUDE.md — KC PP Sync

Last updated: 2026-04-01 (v1.1 — multi-invoice tracker)

## Purpose
KC PP Sync is a Google Cloud Function that syncs job and payment data from Jobber + HeyPros APIs into a Google Sheet for KC Power Clean's subcontractor payment operations. Runs hourly via Cloud Scheduler.

## Architecture

```
src/
  function.ts          Cloud Function entry point + source-sheet sync flow
  adapters/
    jobber.ts          Jobber GraphQL adapter (OAuth, throttle, job/invoice queries)
    heypros.ts         HeyPros GraphQL adapter (auth, token cache, job queries)
    sheets.ts          Google Sheets adapter (read job#s, batch update, GTP refresh, layout detection)
  config/
    constants.ts       HEADER_ROW, HEYPROS_FILE_BASE, column layout maps (NEW_LAYOUT_COLS, LEGACY_LAYOUT_COLS)
    env.ts             Environment config loading
    types.ts           Shared interfaces (HeyProsJobDetail, JobberPaidJob)

test/
  output-sheet.test.ts Auto-column, multi-invoice, auto-notes, round-robin tests (41 tests)

dist/                  Compiled output (tracked in git, gcp-build is no-op)
references/            Jobber schema docs, HeyPros API reference links
```

## Commands
```bash
npm test          # Run all tests (tsx --test)
npm run build     # TypeScript compile
npm run local     # Local functions-framework server
```

## Deploy
```bash
gcloud functions deploy kc-pp-sync \
  --gen2 --runtime nodejs22 --region us-central1 \
  --source . --entry-point kcPPSync \
  --trigger-http --allow-unauthenticated \
  --memory 256Mi --timeout 300s --max-instances 1
```

## Dual Layout System

The sync supports TWO column layouts:

- **New layout (March forward):** 39 columns (A–AM) with multi-invoice tracker
- **Legacy layout (January 2026, February 2026):** 26 columns (A–Z), single invoice per row

Detection: `isNewLayout(tabName)` checks tab naming. New = `"March"`, `"April"` (no year). Legacy = `"January 2026"` (with year).

Tab naming convention:
| Tab | Example (new) | Example (legacy) |
|-----|---------------|-------------------|
| Monthly one-off | `March` | `January 2026` |
| Recurring | `March - R` | N/A |
| Good to Pay | `March - GTP $` | `GTP $ - January` |

## How the Sync Works

1. Read Job #s from column F (F2:F500) of the target month tab
2. Fetch Jobber jobs/invoices by job number (GraphQL)
3. Fetch HeyPros WOs by purchaseOrder match (GraphQL, paginate all pages)
4. **Filter HeyPros WOs by target month** (installationStarts date must fall within the tab's month)
5. Round-robin assign filtered WOs to sheet rows (sorted by installationStarts ascending)
6. **Detect layout** via `isNewLayout()` → branch column mapping
7. Build auto-notes (X for new, Z for legacy)
8. Batch update auto columns only (never touch manual columns)
9. Refresh GTP $ tab (monthly tabs only)

## New Layout (March+): A–AM (39 columns)

| Col | Header | Mode | Notes |
|-----|--------|------|-------|
| A | Date | Auto | From HeyPros installationStarts |
| B | REVIEW | Manual | Checkbox |
| C | Company Name | Auto | From HeyPros contractor |
| D | PP Owner Name | Auto | From HeyPros contractor |
| E | HeyPros ID # | Auto | HYPERLINK to HeyPros job page |
| F | Job # | Manual | Input — this drives the sync |
| G | Jobber Link | Auto | HYPERLINK to Jobber job |
| H | Job Status | Auto | From Jobber |
| I | Job Type | Auto | From Jobber |
| J | Client Name | Auto | HYPERLINK to Jobber client |
| K | Division | Auto | From Jobber |
| **L** | **# of Invoices** | **Auto** | Count of all Jobber invoices for this Job # |
| **M** | **Total Invoiced** | **Auto** | Sum of all invoice amounts ($#,##0.00) |
| **N** | **All Paid?** | **Auto** | ✅ if all paid, ❌ if any unpaid |
| O | HeyPros Invoice # | Auto | Primary accepted invoice (was Q) |
| P | Sub Invoice Amount | Auto | Sum of accepted HP invoices (was R) |
| **Q** | **KCPC Released Amount** | **Manual** | Currency (was S) |
| R | Contractor Invoice PDF | Auto | HYPERLINK or "See Auto Note" (was T) |
| **S** | **Payment Status** | **Manual** | Dropdown: Good to Pay, NO CLIENT PAY, On Hold, Pending Approval in HP (was U) |
| **T** | **Payment Tracking** | **Manual** | Dropdown: PAID, AWAITING FOR PAYMENT (was V) |
| **U** | **Payment Method** | **Manual** | Dropdown: QBO-Billpay- ACH/Check, ACH - 9292 (was W) |
| **V** | **Date of Payment** | **Manual** | (was X) |
| **W** | **Notes / Remarks** | **Manual** | Human-owned, sync NEVER touches (was Y) |
| X | Auto Notes | Auto | Rebuilt every sync (was Z) |
| Y–AM | Invoice Tracker | Auto | 5 slots × 3 cols (Invoice #, Amount, Paid?) |

### Invoice Tracker Block (Y–AM)

| Slot | Invoice # | Amount | Paid? |
|------|-----------|--------|-------|
| 1 | Y | Z | AA |
| 2 | AB | AC | AD |
| 3 | AE | AF | AG |
| 4 | AH | AI | AJ |
| 5 | AK | AL | AM |

Sorted by invoice number ascending. Auto-populated from Jobber API. >5 invoices → auto note warning.

### New Layout Auto Columns
A, C, D, E, G, H, I, J, K, L, M, N, O, P, R, X, Y–AM

### New Layout Manual Columns (never auto-written)
B, F, Q, S, T, U, V, W

## Legacy Layout (Jan/Feb): A–Z (26 columns)

| Col | Header | Mode |
|-----|--------|------|
| A–K | Same as new | Same |
| L | Invoice Number | Auto (HYPERLINK) |
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

Legacy supports manual hold: Invoice # column L = "-" → skip M/N/O/P sync.

## GTP $ Tab

Filters monthly tab for rows meeting criteria:
- **New layout:** N (All Paid?) = ✅, S (Payment Status) = "Good to Pay", T (Payment Tracking) = "AWAITING FOR PAYMENT"
- **Legacy layout:** O (Invoice Status) = "Paid", U = "Good to Pay", V = "AWAITING FOR PAYMENT"

Output: Date, Company Name, PP Owner, Job #, Sub Invoice Amount, Paid check, Payment Status, Payment Tracking

## Invoice Status Filtering (HeyPros)

| Status | Count in amount? | Auto note |
|--------|-----------------|-----------|
| Accepted | ✅ Yes | (none) |
| Pending Approval | ❌ No | ⏳ Pending: $X |
| Rejected | ❌ No | ⚠️ Rejected: $X |
| Canceled | ❌ No | ⚠️ Canceled: $X |
| Unknown | ❌ No | ⚠️ Unknown status: $X |

## Auto Notes (X column for new, Z for legacy)

Rebuilt from scratch every sync. Conditions joined with " | ":

| Condition | Note |
|-----------|------|
| 2+ accepted HP invoices | ℹ️ N accepted invoices (...) — download PDFs from HeyPros |
| Rejected invoice | ⚠️ Rejected: $X |
| Canceled invoice | ⚠️ Canceled: $X |
| Pending invoice | ⏳ Pending: $X |
| Unknown status | ⚠️ Unknown status "label": $X |
| No HeyPros match | ⚠️ WO# not found in HeyPros |
| Multi-contractor | ℹ️ Multi-contractor job (N WOs this month) |
| No Jobber data | ⚠️ Job# not found in Jobber |
| Extra row (no WO) | ⚠️ No HeyPros WO for this row |
| Manual hold (legacy) | ⏸️ Manual invoice hold (L = "-") |
| Shared invoice | 🔗 Shared Invoice #X (also on row N) |
| >5 invoices (new) | ⚠️ Job has N invoices — only first 5 shown in tracker |
| Partial payment (new) | 🔴 N of M client invoices unpaid |

## Key Technical Details

- HeyPros amounts are in **CENTS** — divide by 100 for dollars
- HeyPros hashidNumeric displayed as dashed: 9331562 → 9-331-562
- HeyPros job URL: `https://kc-power-clean.heypros.com/job/{hashid}`
- HeyPros file URL: `https://hey-pros-api.birdsdontexist.com/files/{fileName}`
- Jobber uses `searchTerm` for fuzzy search, then exact integer filter client-side
- Jobber `receivedDate` = paid date (no `paidDate` field exists)
- All sheet writes use `USER_ENTERED` (required for HYPERLINK formulas)
- Dates formatted as M/D/YYYY using UTC
- Cloud Functions can only write to `/tmp` (token caches live there)
- HeyPros signIn rate limited: max 1 attempt per 15 min, tokens last 60 min
- `isNewLayout()` detects layout by tab name (no year suffix = new layout)

## Gotchas

- HeyPros WO# (`purchaseOrder`) is NOT unique — multiple WOs can share one Job#
- HeyPros `jobsDashboard` does NOT return Closed/Paid WOs — purged from API
- HeyPros introspection is disabled — cannot query `__schema` or `__type`
- Jobber `searchTerm` is fuzzy — always filter exact match client-side
- `gcp-build` script is a no-op (dist/ pre-built locally) — do not change this
- **Legacy tabs (Jan/Feb) have different column positions** — all code must branch on `isNewLayout()`

## What NOT to Touch

- Manual columns: new layout (B, F, Q, S, T, U, V, W) / legacy (B, F, S, U, V, W, X, Y)
- Conditional formatting rules (38 per tab on March)
- Data validations (dropdowns on S, T, U, H, I, K)
- `gcp-build` script behavior (must remain `"true"` — no-op)
