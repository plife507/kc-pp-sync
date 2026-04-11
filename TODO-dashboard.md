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
- Payment status detection via `getDashboardColIndices()` — returns correct indices for all 3 layouts:
  - New one-off (March+): T(19) status, U(20) tracking, Q(16) sub amt, O(14) all paid
  - Legacy one-off (Feb, with margin col C): V(21) status, W(22) tracking, S(18) sub amt, P(15) inv status
  - Recurring (no margin col C): U(20) status, V(21) tracking, R(17) sub amt, O(14) inv status
- "Paid" tracked via Payment Status column only (not All Paid / client payment)
- CF: 10-band gradient on % Paid column (E) and all profitability margin columns
- `extractMonthName()` handles abbreviated month names (Feb → February)
