# TODO: Payment Dashboard

## Status: ✅ COMPLETE

Deployed as part of revision kc-pp-sync-00050+ series. Auto-refreshes after every sync.

## What was built

**Payment Status section (rows 1–14):**
- 15 columns: Month | Total Jobs | Total $ | # Paid | % Paid | # Good to Pay | % GTP | # On Hold | % On Hold | # Pending Approval | % PA | # No Client Pay | % NCP | # Blank | % Blank
- One row per month (February–present). January excluded per Nathan.
- Recurring tab rows merged into same month totals as one-off tabs
- "No Payment" rows excluded entirely
- "NO CLIENT PAY" tracked as its own column (sub still gets paid — different from "No Payment")
- YTD totals in row 14
- Blue/white header, currency on Total $, alternating row formatting

**Profitability section (rows 18+):**
- See `TODO-profitability.md` (also complete)

## Implementation notes
- `refreshDashboard()` in `src/adapters/sheets.ts`
- Called automatically at end of all monthly sync paths
- Payment status detection: new layout → col S (index 18), legacy/recurring → col U (index 20)
- "Paid" definition: new layout N = "✅", legacy O = "Paid" or "✅"
