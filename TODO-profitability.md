# TODO: Dashboard Profitability Section

## Status: ✅ COMPLETE

Latest revision: kc-pp-sync-00091-zxv. Profitability section live in Dashboard tab starting at row 18.

## What was built

**Section header (row 18):** "📊 Revenue & Profitability" — blue bg, white, bold

**Layout:** 19 columns with 3-way split: One-off | Recurring | Total. Hybrid visible but excluded from totals.

**Data rows:** February through current month, one row per month. YTD at bottom.

**Revenue/Labor gate:** Only counted when client has paid (AllPaid=✅ for new layout, InvoiceStatus="Paid" for legacy/recurring).

**Margin % color coding:** 10-band gradient (deep green ≥90% → deep red <10%, 0% excluded).

## Revenue dedup logic

| Tab type | Dedup key | Revenue source | Notes |
|---|---|---|---|
| New one-off (March+) | Job # (col G, idx 6) | Col N (idx 13) | With margin col C |
| Legacy one-off (Feb) | Invoice # (col M, idx 12) | Col N (idx 13) | With margin col C |
| Recurring (- R tabs) | Invoice # (col L, idx 11) | Col M (idx 12) | No margin col C |

## Key implementation notes
- `refreshProfitabilityDashboard()` in sheets.ts — uses hardcoded indices per section (not `getDashboardColIndices`)
- Returns `Map<string, number>` of month → totalMargin for C1 header alignment
- Dynamic tab discovery (no hardcoded month list)
- `extractMonthName()` handles abbreviated names (Feb → February)
- February recurring now included (was missing before abbreviated month fix)
