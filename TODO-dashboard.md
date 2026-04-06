# TODO: Payment Dashboard — % Jobs Paid

## Objective
Add a "Dashboard" tab to the KC PP Sync spreadsheet that shows payment completion rates:
- % of jobs paid, broken down by Payment Status category
- Aggregated by month and year-to-date
- Excludes any row where column S (Payment Status) = "No Payment"

---

## Context

### Data Sources
- **New layout tabs** (March, April, May…): 39 columns A–AM
  - Column S (index 18) = Payment Status — 7-value dropdown
  - Column N (index 13) = All Paid? — "✅" or "❌"
  - Column F (index 5) = Job #
  - Column P (index 15) = Sub Invoice Amount
- **Legacy layout tabs** (January 2026, February 2026): 26 columns A–Z
  - Column U (index 20) = Payment Status
  - Column O (index 14) = All Paid?
- **Recurring tabs** (March - R, April - R…): same 26-column legacy layout
  - Column U = Payment Status, Column V = Payment Tracking

### Payment Status Dropdown Values (column S / U)
- `Good to Pay`
- `No Payment` ← **EXCLUDE these rows from all calculations**
- `On Hold`
- `Paid` (legacy only — normalize to "✅" equivalent)
- `Pending Approval` (or similar)
- Blank = not yet set

### "Paid" Definition
A job row counts as **Paid** when:
- New layout: `N = "✅"` (All Paid?)
- Legacy layout: `O = "Paid"` or `O = "✅"`

### Tabs to Include
All month tabs, legacy tabs, and recurring tabs — listed in the source constants. 
Exclude: `Log`, `Dashboard` itself, `GTP $` tabs, and any non-month utility tabs.

---

## Phases

### Phase 1 — Design the Dashboard Schema
**Goal:** Define the exact row/column structure of the Dashboard tab before writing any code.

**Decisions (confirmed by Nathan 2026-04-06):**
- Recurring tab rows → merged into same month totals as one-off tabs
- "No Payment" rows → excluded from main table, shown in a separate Notes section below
- $ amounts → include sub invoice totals alongside job counts

**Tasks:**
- [ ] Define main table layout: one row per month (Jan–Dec 2026), plus a YTD summary row
- [ ] Define main table columns:
  - Month name
  - Total jobs (excl. No Payment rows)
  - Total $ (sum of Sub Invoice Amount, excl. No Payment)
  - # Paid / % Paid
  - # Good to Pay / % Good to Pay
  - # On Hold / % On Hold
  - # Pending Approval / % Pending Approval
  - # Blank/Unknown / % Blank/Unknown
- [ ] Define YTD row: sums all months with data
- [ ] Define No Payment Notes section (below main table, separated by blank row):
  - Header: "Excluded — No Payment (will never be paid)"
  - One row per month: Month | # Jobs excluded | Total $ excluded
  - YTD excluded row at bottom
- [ ] Column S/U detection logic:
  - Legacy one-off (January 2026, February 2026) → column U (index 20)
  - New one-off (March, April, May…) → column S (index 18)
  - All recurring (- R tabs) → column U (index 20), always legacy layout

**Gates:**
- [ ] Schema reviewed and approved by Nathan before Phase 2 begins
- [ ] Column definitions confirmed against actual dropdown values in the sheet

---

### Phase 2 — Cloud Function: Data Aggregation
**Goal:** Add a `refreshDashboard()` function to the Cloud Function that reads all month tabs and computes the payment stats.

**Tasks:**
- [ ] Add `refreshDashboard(spreadsheetId: string): Promise<void>` to `sheets.ts`
- [ ] Logic:
  1. Read list of active month tabs from constants (same list used by sync)
  2. For each tab:
     a. Read all rows (F=Job#, N or O=All Paid?, S or U=Payment Status)
     b. Skip rows where Payment Status = "No Payment" (case-insensitive)
     c. Skip header row and blank Job # rows
     d. Count: total, paid, good_to_pay, on_hold, pending_approval, blank
     e. Compute % for each category
  3. Build 2D array matching Dashboard schema (Phase 1)
  4. Write to Dashboard tab (clear + write)
- [ ] Add `refreshDashboard: true` flag to req.body handler in `function.ts`
- [ ] Call `refreshDashboard()` automatically at end of monthly sync (alongside GTP refresh)
- [ ] Log dashboard refresh result to Log tab

**Gates:**
- [ ] Unit test: manually verify counts for March tab against known data
- [ ] Dashboard tab populates correctly with no errors in Cloud Run logs
- [ ] "No Payment" rows are confirmed excluded
- [ ] YTD row totals match sum of individual months

---

### Phase 3 — Dashboard Tab Formatting
**Goal:** Make the Dashboard tab visually clean and readable in Sheets.

**Tasks:**
- [ ] Create Dashboard tab if it doesn't exist (position: first tab or after Log)
- [ ] Header row: bold, blue background (#1a73e8), white text
- [ ] Month rows: alternating light gray / white
- [ ] YTD row: bold, light blue background
- [ ] % columns: formatted as percentage (0.0%)
- [ ] # columns: formatted as integer
- [ ] Month column: left-aligned
- [ ] Frozen header row
- [ ] Column widths: Month=100px, count cols=80px, % cols=80px
- [ ] Add "Excludes rows marked No Payment" note in A1 subtitle or adjacent cell
- [ ] Conditional formatting on % Paid column: red <50%, yellow 50–79%, green ≥80%

**Gates:**
- [ ] Visual QA: screenshot or manual review of Dashboard tab
- [ ] All 12 month rows present (even if data = 0)
- [ ] YTD row displays correctly
- [ ] CF rules applied and visible

---

### Phase 4 — Integration & Deploy
**Goal:** Wire everything together and deploy to production.

**Tasks:**
- [ ] Add `{"refreshDashboard": true}` trigger support to Cloud Run endpoint
- [ ] Add `refreshDashboard()` call to end of all monthly sync flows (current + prev month)
- [ ] Update Cloud Scheduler: no new jobs needed (dashboard refreshes after each sync)
- [ ] Deploy new revision
- [ ] Trigger full sync + dashboard refresh
- [ ] Verify Log tab shows dashboard refresh event
- [ ] Commit to git with message: "feat: payment dashboard tab"

**Gates:**
- [ ] Cloud Run deploys without error
- [ ] Dashboard refreshes automatically after a monthly sync
- [ ] No regressions on existing sync, GTP, or Log tab behavior
- [ ] Git commit pushed

---

## Constraints & Rules
- Do NOT touch manual columns (B, L, S, T, U, V, W, X on new layout)
- Dashboard tab is READ-ONLY from user perspective — written entirely by Cloud Function
- "No Payment" exclusion must be case-insensitive
- Recurring tab data should be included in the same month row as the one-off tab (they share the same month)
- Legacy tabs (January 2026, February 2026) must use U column for Payment Status, O for All Paid?
- Do not break existing sync, GTP refresh, or Log tab behavior
- All new code in TypeScript with proper types

## Abort If
- Phase 1 schema is not approved before coding starts
- Column S dropdown values are different from what's listed above — verify first

## Resolved Decisions
- Recurring rows → merged into same month totals ✅ (confirmed 2026-04-06)
- $ amounts → included alongside job counts ✅ (confirmed 2026-04-06)
- "No Payment" rows → excluded from main table, shown in separate Notes section below ✅ (confirmed 2026-04-06)

## Open Questions
- Exact dropdown values in col S — verify from sheet validation rules before Phase 2
