# TODO: Dashboard Profitability Section

## Status: ✅ COMPLETE

Deployed as revision kc-pp-sync-00053-hg4. Profitability section live in Dashboard tab starting at row 18.

## What was built

**Section header (row 18):** "📊 Revenue & Profitability" — blue bg, white, bold

**Column headers (row 19):**
Month | One-off Revenue | Recurring Revenue | Total Revenue | Total Labor | Gross Profit | Margin % | Uninvoiced Labor | # Jobs | # Recurring Rows

**Data rows:** February through current month, one row per month. YTD at bottom.

**Margin % color coding:**
- Green (≥65%)
- Yellow (40–65%)
- Red (<40%)

## Revenue dedup logic

| Tab type | Dedup key | Revenue source |
|---|---|---|
| Legacy one-off (Feb 2026) | Invoice # (col L) — once per unique | Col M |
| New one-off (March+) | Job # (col F) — once per unique | Col M |
| Recurring (- R tabs) | Invoice # (col L) — once if populated | Col M |

Recurring uninvoiced rows: labor counted, revenue = $0.

## Open
- Remaining Balance column (Sub Invoice Amount − KCPC Released Amount): paused, scope TBD — see `TODO.md`
