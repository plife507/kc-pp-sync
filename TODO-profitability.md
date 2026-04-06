# TODO: Dashboard Profitability Section

## Goal
Add a new "Revenue & Profitability" section to the existing Dashboard tab,
below the payment status section (starting row 20), covering Feb forward.

## Tab Layout Rules

### Legacy one-off (February 2026):
- Dedup key: col L (Invoice Number) — one invoice can have 1 row
- Revenue: col M (Jobber Invoice Total Amount) — taken ONCE per unique L
- Labor: col R (Sub Invoice Amount) — summed across ALL rows
- Payment Status: col U

### New one-off (March, April, May...):
- Dedup key: col F (Job #) — one job can have 2+ rows (multi-contractor)
- Revenue: col M (Total Invoiced) — taken ONCE per unique F
- Labor: col P (Sub Invoice Amount) — summed across ALL rows
- Payment Status: col S

### Recurring (Feb - R, March - R, April - R...):
- Dedup key: col L (Invoice Number) — multiple visits can share 1 invoice
- Revenue: col M (Jobber Invoice Total Amount) — taken ONCE per unique L, ONLY if L is populated
- Labor: col R (Sub Invoice Amount) — summed across ALL rows (invoiced AND uninvoiced)
- Uninvoiced labor: rows where L is empty — labor counted, revenue = $0
- Payment Status: col U

## Detection Logic
- Tab name "February 2026" → legacy one-off
- Tab name "March", "April", "May"... (no year, no " - R", no " - GTP $") → new one-off
- Tab name ends with " - R" → recurring
- Tab name "Jan..." (skip), "Dashboard", "Command", "GTP", etc → skip

## Output: New section in Dashboard tab

Start at row 20. Row 19 = blank separator. Row 18 = section divider header.

### Header row (row 18):
"📊 Revenue & Profitability" (merged across all cols, blue bg, white text, bold)

### Column header (row 19):
A: Month
B: One-off Revenue
C: Recurring Revenue
D: Total Revenue
E: Total Labor
F: Gross Profit
G: Margin %
H: Uninvoiced Labor
I: # Jobs
J: # Recurring Rows

### Data rows (row 20 onward, one per month Feb through current):
Month order: February, March, April, May, June, July, Aug, Sep, Oct, Nov, Dec

### YTD row after last month:
A: "YTD"
B-J: sums

## Formatting
- Header row: blue bg (26,115,232), white text, bold
- YTD row: light blue bg (197,224,180), bold
- Cols B/C/D/E/F/H: currency format ($#,##0.00)
- Col G: percentage format (0.0%)
- Col G conditional formatting:
  - >= 65%: green bg (198,239,206)
  - 40-65%: yellow bg (255,235,156)
  - < 40%: red bg (255,199,206)
- Frozen header (row 19)
- Col A width: 120px, others: 140px

## Implementation

### File: src/adapters/sheets.ts
Add function: `refreshProfitabilityDashboard(spreadsheetId: string, auth: any): Promise<void>`

Logic:
1. Get all sheet names from spreadsheet
2. For each month Feb→Dec (in order):
   a. Find one-off tab (legacy or new layout based on name)
   b. Find recurring tab ({abbrev} - R or "Feb - R")
   c. If neither exists, skip month
3. Aggregate per month using rules above
4. Build rows array + YTD
5. Clear old profitability section (rows 18 onward in Dashboard)
6. Write header, column headers, data rows, YTD row
7. Apply formatting via batchUpdate

### File: src/function.ts
Call `refreshProfitabilityDashboard()` after existing `refreshDashboard()` call
(in both the monthly sync path and the recurring sync path).

## Month Name Mapping
```
'February 2026' → display 'February', recurring tab = 'Feb - R'
'March'         → display 'March',    recurring tab = 'March - R'
'April'         → display 'April',    recurring tab = 'April - R'
'May'           → display 'May',      recurring tab = 'May - R'
... etc
```

## Edge Case: No Payment Rows
- One-off: exclude rows where Payment Status (S/U) starts with "No Payment" or equals "No Payment"
- Recurring: include all rows in labor (cash is out regardless); revenue still deduped by invoice

## Gate: Pass criteria
1. Runs without throwing
2. Dashboard tab has profitability section starting at row 18
3. February revenue matches manual check: sum unique invoice M values from "February 2026" tab
4. March revenue matches: sum unique job# M values from "March" tab
5. Multi-invoice dedup verified: job 1484 on March - R (5 rows, inv 50017 $1,125) shows revenue $1,125 not $5,625
6. Multi-contractor dedup verified: job 20026 on March (3 rows) shows revenue once not 3x
7. Uninvoiced labor column shows non-zero for any recurring rows missing Invoice#
8. YTD row sums correctly

## Working directory
/data/.openclaw/workspace/projects/kc-pp-sync
