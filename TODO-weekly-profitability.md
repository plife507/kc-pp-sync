# TODO: Weekly Profitability Breakdown

**Branch:** feat/weekly-profitability  
**Scope:** `src/adapters/sheets.ts` → `refreshProfitabilityDashboard()` only  
**Goal:** Replace the monthly row grouping in the profitability section with **weekly rows (Sunday → Saturday)**

---

## Context

The Dashboard has two distinct sections:

1. **Top section (rows 1–16):** Payment stats by month — `refreshDashboard()`. **DO NOT TOUCH.**
2. **Profitability section (rows 18+):** Revenue/labor/margin — `refreshProfitabilityDashboard()`. **THIS is what we're changing.**

The profitability section currently writes one row per month (February, March, April, YTD). Nathan wants one row per **calendar week (Sunday–Saturday)** instead of one row per month, plus a YTD totals row at the bottom.

---

## What changes

### `refreshProfitabilityDashboard()` in `src/adapters/sheets.ts`

#### Step 1: Data collection stays the same
Keep all the existing data-reading logic (one-off tabs, recurring tabs, legacy vs new layout detection). **No changes to how data is read from the sheets.**

The only change: instead of aggregating by month, we aggregate by week.

#### Step 2: Week key derivation

Every row that passes the invoice gate and payment gate must be mapped to a **week bucket**.

For one-off tabs (main tabs), the job date is in **column A** (index 0). For recurring tabs, date is also **column A** (index 0).

Date format in column A: `M/D/YYYY` (e.g. "3/14/2026") or possibly `YYYY-MM-DD`. Parse both.

Week key derivation (in TypeScript):
```typescript
function getWeekKey(dateStr: string): string | null {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  // Find the Sunday that starts this week
  const day = d.getDay(); // 0=Sun, 6=Sat
  const sunday = new Date(d);
  sunday.setDate(d.getDate() - day);
  // Format as "Apr 6 – Apr 12" (display label)
  // But also store as ISO date string for sorting: "2026-04-06"
  return sunday.toISOString().split('T')[0]; // "YYYY-MM-DD" of the Sunday
}
```

Week display label (column A in output): `"Apr 6 – Apr 12"` format.
```typescript
function weekLabel(sundayIso: string): string {
  const sun = new Date(sundayIso + 'T12:00:00Z');
  const sat = new Date(sun);
  sat.setDate(sun.getDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${fmt(sun)} – ${fmt(sat)}`;
}
```

#### Step 3: Aggregation structure

Replace the `monthData` array with a `Map<string, WeekBucket>` keyed by ISO Sunday date string.

```typescript
interface WeekBucket {
  weekKey: string;  // ISO date of Sunday (for sorting)
  label: string;    // "Apr 6 – Apr 12" (for display)
  oneOffRevenue: number;
  oneOffLabor: number;
  oneOffJobs: Set<string>;      // unique Job# (for dedup + count)
  oneOffExcluded: number;
  recurringRevenue: number;
  recurringLabor: number;
  recurringVisits: number;
  recurringInvoices: Set<string>; // unique Invoice# (for dedup + count)
  recurringExcluded: Set<string>; // unique Invoice# (for dedup + count)
  hybridRevenue: number;
  hybridLabor: number;
  hybridJobs: Set<string>;      // unique Job# (for dedup + count)
}
```

**Important:** Revenue dedup (seenJobs, seenInvoices) must now be **per-week**, not global. A job that spans multiple rows in the same week is still only counted once for revenue that week.

#### Step 4: Row accumulation

For each row that passes the invoice + payment gates, derive its weekKey from column A date. If the weekKey is null/invalid, skip the row (no date = can't bucket it).

One-off new layout: use col A (index 0) date
One-off legacy: use col A (index 0) date  
Recurring: use col A (index 0) date

Accumulate into the Map<weekKey, WeekBucket>.

#### Step 5: Build output rows

Sort the Map entries by weekKey (ISO date string sort = chronological).

For each week:
```
label, oneOffRevenue, oneOffLabor, oneOffMargin%, oneOffJobCount, oneOffExcluded,
recurRevenue, recurLabor, recurMargin%, recurVisits, recurInvoiceCount, recurExcluded,
hybridRevenue, hybridLabor, hybridJobCount,
totalRevenue, totalLabor, grossProfit, totalMargin%
```

Note: `oneOffJobCount = bucket.oneOffJobs.size`, `recurInvoiceCount = bucket.recurringInvoices.size`, etc.

At the bottom, write one **YTD row** that sums all weeks.

#### Step 6: Column headers

Same 19-column layout as current:
```
["Week", "One-off Revenue", "One-off Labor", "One-off Margin %", "# One-off Jobs", "# Excl. (One-off)",
 "Recurring Revenue", "Recurring Labor", "Recurring Margin %", "# Recur. Visits", "# Recur. Invoices", "# Excl. (Recur.)",
 "Hybrid Revenue", "Hybrid Labor", "# Hybrid Jobs",
 "Total Revenue", "Total Labor", "Gross Profit", "Total Margin %"]
```

Column A header changes from `"Month"` to `"Week"`.

#### Step 7: Notes rows

Update the section title from `"📊 Revenue & Profitability"` to `"📊 Revenue & Profitability (Weekly)"`.

Update the first notes bullet to say weeks instead of months. Keep the rest of the methodology notes identical.

#### Step 8: Formatting

All formatting logic (currency cols, % cols, CF bands, YTD row highlight, header row, column widths) stays **identical** — just applied to the new row range (which may be more rows than before since weeks > months).

The `ytdRowIndex0` must be correctly set to `tableDataStart0 + sortedWeeks.length` (not `dataRows.length` which was months).

#### Step 9: Return value (marginByMonth Map)

The function currently returns `Map<string, number>` of `monthName → totalMargin`. This is used in `function.ts` to write C1 margin headers on the monthly tabs.

After this change, the function should still return the **same map by month name** — but now it needs to aggregate the weekly data back up to month level for this purpose.

After building the weekly rows, also compute monthly totals for the C1 header map:
```typescript
// Aggregate weekly data back to month for C1 header writes
const marginByMonth = new Map<string, number>();
for (const m of MONTHS_TO_SCAN) {
  // Sum all weeks where the Sunday falls in this calendar month
  // (use the month name from m.display)
  // Simpler: re-use the already-computed monthData if we track it,
  // OR just compute from weekBuckets filtered by month of the Sunday
}
```

**Easiest approach:** Keep the existing monthly aggregation loop (Step 3 of the current code) **in addition** to the new weekly loop. Use monthly data for the C1 margin map return value, and weekly data for the Dashboard display. This avoids re-deriving month from week keys.

---

## Gates

- [ ] `npm run build` — zero TypeScript errors
- [ ] `npm test` — 61/61 passing (don't need to add new tests, but must not break existing)
- [ ] Weekly rows appear in Dashboard profitability section, sorted chronologically Sun–Sat
- [ ] YTD row at bottom with correct totals
- [ ] C1 header margin on monthly tabs still matches Dashboard (return map unchanged)
- [ ] No changes to top Dashboard section (rows 1–16)
- [ ] No changes to `refreshDashboard()` function

## Abort if
- Any existing test fails
- Build has TypeScript errors
- The C1 margin return map breaks (anything in function.ts that reads it)

## Files to modify
- `src/adapters/sheets.ts` — `refreshProfitabilityDashboard()` only
- `dist/adapters/sheets.js` — compiled output (via `npm run build`)

## Do NOT modify
- `src/function.ts` (no changes needed)
- Any test files (tests don't cover profitability dashboard directly)
- Any other source files
