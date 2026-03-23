# CLAUDE.md — KC PP Sync

Last updated: 2026-03-23

## Purpose
KC PP Sync is a Google Cloud Function that syncs job and payment data from Jobber + HeyPros APIs into a Google Sheet for KC Power Clean's subcontractor payment operations. Runs hourly via Cloud Scheduler.

## Architecture

```
src/
  function.ts          Cloud Function entry point + source-sheet sync flow
  adapters/
    jobber.ts          Jobber GraphQL adapter (OAuth, throttle, job/invoice queries)
    heypros.ts         HeyPros GraphQL adapter (auth, token cache, job queries)
    sheets.ts          Google Sheets adapter (read job#s, batch update auto columns)
  config/
    constants.ts       HEADER_ROW, HEYPROS_FILE_BASE (single source of truth)
    env.ts             Environment config loading
    types.ts           Shared interfaces (HeyProsJobDetail, JobberPaidJob)

test/
  matcher.test.ts      Legacy matcher tests (may need cleanup)
  output-sheet.test.ts Auto-column, multi-invoice, auto-notes, round-robin tests

dist/                  Compiled output (pre-built, gcp-build skips tsc)
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
  --memory 512MB --cpu 0.3333 --timeout 180s --max-instances 1
```

## How the Sync Works

1. Read Job #s from column F of the target month tab
2. Fetch Jobber jobs/invoices by job number (GraphQL)
3. Fetch HeyPros WOs by purchaseOrder match (GraphQL, paginate all pages)
4. **Filter HeyPros WOs by target month** (installationStarts date must fall within the tab's month)
5. Round-robin assign filtered WOs to sheet rows (sorted by installationStarts ascending)
6. **Filter HeyPros invoices by status** (only Accepted count for R/Q/T)
7. Build auto-notes (Z) for edge cases
8. Batch update auto columns only (never touch manual columns)

## Sheet Layout (A-Z, 26 columns)

| Col | Header | Mode | Notes |
|-----|--------|------|-------|
| A | Date | Auto | From HeyPros installationStarts |
| B | REVIEW | Manual | Checkbox |
| C | Company Name | Auto | From HeyPros contractor |
| D | PP Owner Name | Auto | From HeyPros contractor |
| E | HeyPros ID # | Auto | HYPERLINK to HeyPros job page |
| F | Job # | Manual | Input — this drives the sync |
| G | Jobber Link | Auto | HYPERLINK to Jobber job |
| H | Job Status | Auto | From Jobber (title case display) |
| I | Job Type | Auto | From Jobber (title case display) |
| J | Client Name | Auto | HYPERLINK to Jobber client |
| K | Division | Auto | From Jobber |
| L | Invoice Number | Auto | HYPERLINK to Jobber invoice |
| M | Jobber Invoice Total | Auto | Currency $#,##0.00 |
| N | Invoice Issued Date | Auto | From Jobber |
| O | Jobber Invoice Status | Auto | Title case (Paid, Awaiting Payment, etc.) |
| P | Date Invoice Paid | Auto | From Jobber (only when status=paid) |
| Q | HeyPros Invoice # | Auto | Primary accepted invoice |
| R | Sub Invoice Amount | Auto | Sum of ACCEPTED invoices only (cents→dollars) |
| S | KCPC Released Amount | Manual | Currency $#,##0.00 |
| T | Contractor Invoice PDF | Auto | HYPERLINK "View PDF" or "See Auto Note" if multi-invoice |
| U | Payment Status | Manual | Dropdown + CF |
| V | Payment Tracking | Manual | Dropdown + CF |
| W | Payment Method | Manual | Dropdown + CF |
| X | Date of Payment | Manual | |
| Y | NOTES / REMARKS | Manual | Human-owned, sync NEVER touches |
| Z | Auto Notes | Auto | Rebuilt every sync, flags edge cases |

**AUTO_COL_LETTERS:** A, C, D, E, G, H, I, J, K, L, M, N, O, P, Q, R, T, Z (18 columns)

**Manual columns (never auto-written):** B, F, S, U, V, W, X, Y

## Invoice Status Filtering

HeyPros invoices have 4 known statuses:
- **Accepted** (count in R, show in Q/T)
- **Pending Approval** (don't count, flag in Z: "⏳ Pending: $X")
- **Rejected** (don't count, flag in Z: "⚠️ Rejected: $X")
- **Canceled** (don't count, flag in Z: "⚠️ Canceled: $X")
- **Unknown** (don't count, flag in Z: "⚠️ Unknown status: $X")

Multi-invoice behavior:
- 1 accepted: T = HYPERLINK "View PDF", R = amount
- 2+ accepted: T = "See Auto Note", R = sum, Z = HYPERLINK formula listing all
- 0 accepted: T = empty, R = empty

## Month-Filtered WO Assignment

When multiple HeyPros WOs share the same Job#, the sync filters by the target tab's month BEFORE round-robin assignment. This prevents cross-month jobs from showing the wrong contractor.

- Tab name parsed: "March 2026" → month=2 (0-indexed), year=2026
- WOs filtered by installationStarts falling within that month
- WOs with no installationStarts are always included
- Round-robin within the filtered set, sorted by installationStarts ascending

## Auto Notes (Z column)

Z is rebuilt from scratch every sync. Conditions joined with " | ":

| Condition | Note |
|-----------|------|
| 2+ accepted invoices | HYPERLINK formula with all PDFs |
| Rejected invoice | ⚠️ Rejected: $X |
| Canceled invoice | ⚠️ Canceled: $X |
| Pending invoice | ⏳ Pending: $X |
| Unknown status | ⚠️ Unknown status "label": $X |
| No HeyPros match | ⚠️ WO# not found in HeyPros |
| Multi-contractor (2+ WOs this month) | ℹ️ Multi-contractor job (N WOs this month) |
| No Jobber data | ⚠️ Job# not found in Jobber |
| Extra row (no WO) | ⚠️ No HeyPros WO for this row |

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

## Gotchas

- HeyPros WO# (`purchaseOrder`) is NOT unique — multiple WOs can share one Job#
- HeyPros `jobsDashboard` does NOT return Closed/Paid WOs — they're purged from the API
- HeyPros introspection is disabled — cannot query `__schema` or `__type`
- Jobber `searchTerm` is fuzzy — always filter exact match client-side
- `gcp-build` script is a no-op (dist/ pre-built locally) — do not change this

## What NOT to Touch

- Column Y (NOTES / REMARKS) — manual only, sync never writes
- Manual columns: B, F, S, U, V, W, X, Y
- Conditional formatting rules (37 per tab + U "No Payment" + R≠S pink)
- Data validations (7 per tab)
- `gcp-build` script behavior
