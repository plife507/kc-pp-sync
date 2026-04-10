# TODO: Per-Row Margin Column — Insert After Column B

**Requested:** 2026-04-10 by Nathan
**Owner:** AYA-HQ (orchestration + Claude Code for implementation)
**Repo:** plife507/kc-pp-sync (branch: `feat/margin-column`)
**Codebase:** 4,147 lines TypeScript, 43 tests passing, Cloud Run revision kc-pp-sync-00070-7xr
**Sheet:** `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q` (KC PP Sync)

---

## Spec

- **Position:** New column C (after B=Review, before current C=CompanyName)
- **Header:** `[A] Margin %`
- **Auto-computed** by sync function — written as formatted percentage
- **Formula:** `(Total Invoiced − SUM of all Sub Invoice Amounts for same Job#) / Total Invoiced`
- **Multi-contractor rule:** Every row for the same Job# shows the **same combined margin** (sum ALL subs for that job, compute once, write to every row)
- **Payment gate:** Only calculated when **All Paid? = ✅** (new layout) or **Jobber Invoice Status = "Paid"** (Feb legacy). Otherwise write `N/A`
- **Hybrid exclusion:** Division = "Hybrid" → write blank
- **Auto note:** For multi-contractor jobs (>1 row same Job#), append to auto notes: `📊 Job margin X.X% — N subs: $A + $B [+ ...] = $total / $invoiced`
- **Tabs affected:** February, March, April one-off tabs only. NOT recurring tabs.

---

## Tools Available

| Tool | Use For | Notes |
|------|---------|-------|
| `gog drive copy` | Sheet backup (full copy) | `gog drive copy <sheetId> "backup name"` |
| `gog sheets` | Read/verify sheet data | Tab reads, header verification |
| Google Sheets API (via code) | `insertDimension` | Column insertion on live sheet |
| Claude Code (`claude --print`) | Code implementation | Runs Opus, handles complex refactors |
| `npm test` (43 tests) | Compile + test verification | Must pass at each gate |
| `npm run build` | TypeScript compile | Must be clean at each gate |
| `gcloud run deploy` | Cloud Run deployment | Standard deploy command in `.claude/commands/deploy.md` |
| `git` | Version control | Branch per feature, tag completions |
| AYA-DEV (persistent session) | Tool operations (gog CLI, Sheets API) | For sheet manipulation if needed |

---

## Post-Insert Column Maps

### New Layout (March/April) — 39 cols → 40 cols (A–AN)

```
A(0)  Date                    ← unchanged
B(1)  Review                  ← unchanged
C(2)  ★ Margin %              ← NEW INSERT
D(3)  Company Name            ← was C(2)
E(4)  PP Owner                ← was D(3)
F(5)  HeyPros ID #            ← was E(4)
G(6)  Job #                   ← was F(5)
H(7)  Jobber Link             ← was G(6)
I(8)  Job Status              ← was H(7)
J(9)  Job Type                ← was I(8)
K(10) Client Name             ← was J(9)
L(11) Division                ← was K(10)
M(12) # of Invoices           ← was L(11)
N(13) Total Invoiced          ← was M(12)
O(14) All Paid?               ← was N(13)
P(15) HeyPros Invoice #       ← was O(14)
Q(16) Sub Invoice Amount      ← was P(15)
R(17) KCPC Released Amount    ← was Q(16)
S(18) Contractor Invoice PDF  ← was R(17)
T(19) Payment Status          ← was S(18)
U(20) Payment Tracking        ← was T(19)
V(21) Payment Method          ← was U(20)
W(22) Date of Payment         ← was V(21)
X(23) Notes / Remarks         ← was W(22)
Y(24) Auto Notes              ← was X(23)
Z(25) Inv #1                  ← was Y(24)
AA(26) Inv #1 Amt             ← was Z(25)
AB(27) Inv #1 Paid?           ← was AA(26)
AC(28) Inv #2                 ← was AB(27)
AD(29) Inv #2 Amt             ← was AC(28)
AE(30) Inv #2 Paid?           ← was AD(29)
AF(31) Inv #3                 ← was AE(30)
AG(32) Inv #3 Amt             ← was AF(31)
AH(33) Inv #3 Paid?           ← was AG(32)
AI(34) Inv #4                 ← was AH(33)
AJ(35) Inv #4 Amt             ← was AI(34)
AK(36) Inv #4 Paid?           ← was AJ(35)
AL(37) Inv #5                 ← was AK(36)
AM(38) Inv #5 Amt             ← was AL(37)
AN(39) Inv #5 Paid?           ← was AM(38)
```

### Legacy Layout (February) — 26 cols → 27 cols (A–AA)

```
A(0)  Date                    ← unchanged
B(1)  Review                  ← unchanged
C(2)  ★ Margin %              ← NEW INSERT
D(3)  Company Name            ← was C(2)
E(4)  PP Owner                ← was D(3)
F(5)  HeyPros ID #            ← was E(4)
G(6)  Job #                   ← was F(5)
H(7)  Jobber Link             ← was G(6)
I(8)  Job Status              ← was H(7)
J(9)  Job Type                ← was I(8)
K(10) Client Name             ← was J(9)
L(11) Division                ← was K(10)
M(12) Invoice Number          ← was L(11)
N(13) Total Invoiced          ← was M(12)
O(14) Invoice Issued Date     ← was N(13)
P(15) Jobber Invoice Status   ← was O(14)
Q(16) Date Invoice Paid       ← was P(15)
R(17) HeyPros Invoice #       ← was Q(16)
S(18) Sub Invoice Amount      ← was R(17)
T(19) KCPC Released Amount    ← was S(18)
U(20) Contractor Invoice PDF  ← was T(19)
V(21) Payment Status          ← was U(20)
W(22) Payment Tracking        ← was V(21)
X(23) Payment Method          ← was W(22)
Y(24) Date of Payment         ← was X(23)
Z(25) Notes / Remarks         ← was Y(24)
AA(26) Auto Notes             ← was Z(25)
```

---

## FULL BLAST RADIUS

Every column from C onward shifts +1. This is a high-impact refactor.

### sheets.ts (1,596 lines)

| Location | What | Current | After |
|----------|------|---------|-------|
| L50-59 | `AUTO_COL_LETTERS_NEW` | A,C,D,E,G,H,I,J,K,L,M,N,O,P,R,X + Y-AM | A,**C**,D,E,F,H,I,J,K,L,M,N,O,P,Q,S,Y + Z-AN |
| L65 | `AUTO_COL_LETTERS_LEGACY` | A,C,D,E,G,H,I,J,K,L,M,N,O,P,Q,R,T,Z | A,**C**,D,E,F,H,I,J,K,L,M,N,O,P,Q,R,S,U,AA |
| L68 | `RECURRING_AUTO_COL_LETTERS` | unchanged | **NO CHANGE** |
| L19 | readOutputSheet (new) range | `F2:F` | `G2:G` |
| L32 | readOutputSheet (legacy) range | `F2:L` | `G2:M` |
| L193-204 | extractGtpRows COL_ constants | COL_COMPANY=2, PP_OWNER=3, JOB_NUM=5, CLIENT_NAME=9, PAID_CHECK=13/14, SUB_AMT=15/17, PAY_STATUS=18/20, PAY_TRACK=19/21 | All +1 |
| L236 | GTP read range | new `A2:T`, legacy `A2:V` | new `A2:U`, legacy `A2:W` |
| L329 | formatLinkColumns indices | new [4,6,9,17], legacy [4,6,9,19] | new [5,7,10,18], legacy [5,7,10,20] |
| L489-493 | getDashboardColIndices | legacy {20,21,17,14}, new {18,19,15,13} | legacy {21,22,18,15}, new {19,20,16,14} |
| L591 | refreshDashboard Job# | `row[5]` | `row[6]` |
| L1027-28 | profitability read range | new `A2:S`, legacy `A2:U` | new `A2:T`, legacy `A2:V` |
| L1041-51 | profitability legacy indices | [5],[11],[10],[12],[14],[17],[20] | [6],[12],[11],[13],[15],[18],[21] |
| L1087-97 | profitability new indices | [5],[11],[10],[12],[13],[15],[18] | [6],[12],[11],[13],[14],[16],[19] |

### function.ts (1,039 lines)

| Location | What | Current | After |
|----------|------|---------|-------|
| L212-227 | values.A-K assignments | C,D,E,G,H,I,J,K | D,E,F,H,I,J,K,L |
| L240-252 | new layout invoice cols | L,M,N,O,P,R | M,N,O,P,Q,S |
| L260-265 | tracker slot letters | Y-AM (5×3) | Z-AN (5×3) |
| L289 | auto notes init (new) | `values.X = ""` | `values.Y = ""` |
| L295-298 | legacy HP/sub/PDF/notes | Q,R,T,Z | R,S,U,AA |
| L301-306 | legacy invoice cols | L,M,N,O,P | M,N,O,P,Q |
| L314 | autoNotesCol | new:"X", legacy:"Z" | new:"Y", legacy:"AA" |
| L389-407 | manual protect deletes | new: O,P,R; legacy: Q,R,T | new: P,Q,S; legacy: R,S,U |
| L423 | notesCol | new:"X", legacy:"Z" | new:"Y", legacy:"AA" |
| L794 | mismatch CF endColumnIndex | 39 | 40 |
| L799 | mismatch CF formula (new) | `$N2="✅",$S2="NO CLIENT PAY"` | `$O2="✅",$T2="NO CLIENT PAY"` |
| L870 | debugCF default col | 18 | 19 |
| **NEW** | `values.C` | — | Margin % value |

### config/constants.ts (79 lines)

| Location | What | Current | After |
|----------|------|---------|-------|
| L1-39 | HEADER_ROW (new layout) | 39 elements A-AM | 40 elements A-AN, insert `"[A] Margin %"` at index 2 |
| L44-70 | HEADER_ROW_LEGACY | 26 elements A-Z | 27 elements A-AA, insert `"[A] Margin %"` at index 2 |

### test/output-sheet.test.ts (480 lines)

| Location | What | Impact |
|----------|------|--------|
| All AUTO_COL_LETTERS tests | Column membership assertions | Must update expected columns |
| Manual column exclusion tests | B,F,S,U,V,W,X,Y | Must shift to new positions |
| Size assertions | `size === 18` / `size === 28` | Must update counts |

### NOT Affected (verify only)

| Component | Why Safe |
|-----------|---------|
| Recurring tabs | No column insert, no code change |
| `RECURRING_AUTO_COL_LETTERS` | Recurring layout independent |
| `readRecurringTabRows` (L91) | Reads recurring tabs only |
| `batchUpdateRecurringColumns` | Writes recurring tabs only |
| Recurring profitability indices (L1141-56) | Reads recurring tabs only |
| Dashboard output layout | Dashboard writes its own A–S columns |
| GTP output layout | GTP writes its own A–I columns |
| Command/Log tab | Independent layout |

---

## Phase 0: Backup & Branch
> Create safety nets before touching anything.

### Tasks
- [ ] 0.1 — **Sheet backup:** Use `gog drive copy` to create a full copy of the KC PP Sync spreadsheet. Name it `KC PP Sync — BACKUP 2026-04-10 (pre-margin)`. Record the backup file ID.
- [ ] 0.2 — **Git backup:** Push current master to origin (it's 1 commit ahead). Verify remote is current.
- [ ] 0.3 — **Create feature branch:** `git checkout -b feat/margin-column`
- [ ] 0.4 — **Record baseline metrics:** Run all 4 sync modes (or read recent Cloud Run logs), capture current Dashboard and Profitability values for comparison after deploy. Save to `phases/margin-baseline.md`.
- [ ] 0.5 — **Verify tests pass:** `npm test` — confirm 43/43 passing on the feature branch before any changes.

### Gate 0
- [ ] Sheet backup exists in Google Drive with correct name and file ID recorded
- [ ] `git log origin/master..master` shows 0 commits (pushed)
- [ ] On branch `feat/margin-column`
- [ ] Baseline metrics captured (Dashboard totals for Feb/Mar/Apr, Profitability margins)
- [ ] 43/43 tests passing

---

## Phase 1: Column Insert (Sheet Structure Only)
> Insert blank column C on Feb, March, April tabs. No code changes. Verify data integrity.

### Tasks
- [ ] 1.1 — **Pause Cloud Scheduler jobs** to prevent sync during column insert: disable all 4 scheduler jobs temporarily (`gcloud scheduler jobs pause`)
- [ ] 1.2 — Use Google Sheets API `insertDimension` to insert 1 column at **columnIndex 2** (before current C) on February tab
- [ ] 1.3 — Same for March tab
- [ ] 1.4 — Same for April tab
- [ ] 1.5 — Write header `[A] Margin %` to cell C1 on all three tabs
- [ ] 1.6 — **Verify data integrity on each tab:**
  - Read row 1 headers: B=Review, C=Margin%, D=CompanyName (was C)
  - Read 3 data rows: spot-check that Job# data, payment data, auto notes, tracker data all shifted correctly
  - Verify dropdown validations still work (check a Payment Status cell)
  - Verify conditional formatting still applies to correct columns

### Gate 1
- [ ] All three tabs have new column C with header `[A] Margin %`
- [ ] Headers verified: B=Review, C=[A] Margin %, D=Company Name, ..., on all 3 tabs
- [ ] 3 spot-checked rows per tab show correct data (no column misalignment)
- [ ] Dropdowns still functional
- [ ] CF rules still apply correctly (Sheets auto-shifts column references in CF)
- [ ] Schedulers still paused

### Abort Condition
- If `insertDimension` corrupts data or misaligns columns → restore from backup spreadsheet copy

---

## Phase 2: Code Refactor — Column Shift
> Update ALL hardcoded column references. This is the highest-risk phase.
> **Execute with Claude Code** — single coordinated refactor of all files.

### Approach
- Give Claude Code the complete column mapping (old→new) and let it refactor all files in one pass
- Then manually verify the diff against the blast radius table
- Then run tests (which will fail until test assertions are also updated)

### Tasks
- [ ] 2.1 — **Claude Code refactor:** Pass the full blast radius table + column maps as context. Have Claude Code update:
  - `src/adapters/sheets.ts` — all column letters, indices, ranges
  - `src/function.ts` — all values.X assignments, tracker slots, mismatch CF, notes col, protect deletes
  - `src/config/constants.ts` — HEADER_ROW and HEADER_ROW_LEGACY arrays
  - `test/output-sheet.test.ts` — all assertions for column sets, sizes, exclusions
- [ ] 2.2 — **Diff review:** `git diff --stat` + manual review of every changed line against the blast radius table. Verify:
  - No old column references remain for C+ positions
  - `RECURRING_AUTO_COL_LETTERS` is untouched
  - Recurring code paths are untouched
  - Dashboard/GTP output layouts are untouched (they write their own columns)
- [ ] 2.3 — **Build:** `npm run build` — must compile clean
- [ ] 2.4 — **Tests:** `npm test` — must pass (with updated assertions)
- [ ] 2.5 — **Add new `values.C` placeholder:** In function.ts, add `values.C = "";` (placeholder — Phase 3 adds real logic). This ensures the column is in `AUTO_COL_LETTERS_NEW` and `AUTO_COL_LETTERS_LEGACY` and gets written on sync.
- [ ] 2.6 — **Commit:** `git add -A && git commit -m "refactor: shift all columns C+ for margin column insert"`

### Gate 2
- [ ] `npm run build` — 0 errors
- [ ] `npm test` — all tests pass (count may change if tests added)
- [ ] `git diff HEAD~1 --stat` shows changes only in: sheets.ts, function.ts, constants.ts, output-sheet.test.ts
- [ ] No remaining references to pre-shift column positions for C+ (grep verification)
- [ ] Full grep: `grep -rn '"X"' src/` shows zero hits for auto notes (should be "Y"/"AA" now)
- [ ] Full grep: `grep -rn '"Y".*slot\|"Z".*slot\|"AA".*slot' src/` confirms tracker starts at Z
- [ ] `RECURRING_AUTO_COL_LETTERS` byte-identical to before

---

## Phase 3: Margin Calculation Logic
> Add the margin computation. Write to column C.

### Tasks
- [ ] 3.1 — **Design the margin calculation function** (can be in sheets.ts or function.ts):
  ```typescript
  // After building all row updates for a one-off tab:
  // 1. Group updates by Job# (from the Jobber data already fetched)
  // 2. For each group, sum all Sub Invoice Amounts
  // 3. Get Total Invoiced (same for all rows with same Job#)
  // 4. margin = (totalInvoiced - totalSubCost) / totalInvoiced
  // 5. Write formatted "XX.X%" to values.C for every row in group
  ```
- [ ] 3.2 — **Implement in function.ts** — after the existing row-building loop (around line ~410 area, after shared invoice detection):
  - New layout: Total Invoiced from `values.N` (was M), Sub Invoice Amt from `values.Q` (was P), All Paid from `values.O` (was N), Division from `values.L` (was K)
  - Legacy: Total Invoiced from `values.N` (was M), Sub Invoice Amt from `values.S` (was R), Invoice Status from `values.P` (was O), Division from `values.L` (was K)
- [ ] 3.3 — **Payment gate:** Check All Paid? / Invoice Status before computing. If not paid → `values.C = "N/A"`
- [ ] 3.4 — **Hybrid exclusion:** If Division = "Hybrid" → `values.C = ""`
- [ ] 3.5 — **Edge cases:**
  - Total Invoiced = 0 or missing → `N/A`
  - Sub Invoice Amount = 0 or missing → 100% (no sub cost = all margin)
  - Negative margin → show negative % (flags data issue for Nathan)
- [ ] 3.6 — **Multi-contractor auto note:** For groups with >1 row, append to auto notes column (Y new / AA legacy):
  `📊 Job margin XX.X% — N subs: $A + $B = $total / $invoiced`
- [ ] 3.7 — **Build + test:** `npm run build && npm test`
- [ ] 3.8 — **Add tests** for margin calculation:
  - Single contractor, paid → correct margin
  - Single contractor, unpaid → N/A
  - Multi-contractor (2 rows), paid → same margin on both
  - Hybrid → blank
  - Zero invoiced → N/A
- [ ] 3.9 — **Commit:** `git add -A && git commit -m "feat: add per-row margin calculation to column C"`

### Gate 3
- [ ] `npm run build` — 0 errors
- [ ] `npm test` — all pass including new margin tests
- [ ] Known test case: Job #19737 (March, 2 subs $565+$375=$940, Total $4,420.28) → margin 78.7% on both rows
- [ ] Known test case: unpaid job → N/A
- [ ] Known test case: Hybrid → blank

---

## Phase 4: Deploy & Verify
> Deploy to Cloud Run. Trigger syncs. Compare against baseline.

### Tasks
- [ ] 4.1 — **Resume Cloud Scheduler** (paused in Phase 1)... actually no — deploy first, THEN resume.
- [ ] 4.2 — **Deploy:** `gcloud run deploy kc-pp-sync --source . --region us-central1 --project aya-gservicies --no-allow-unauthenticated --memory 512Mi --cpu 0.1666 --timeout 300 --max-instances 1`
- [ ] 4.3 — **Trigger March sync manually** (via `curl` or Cloud Console):
  - Verify column C has margin values for paid one-off jobs
  - Verify column C = N/A for unpaid jobs
  - Verify column C = blank for Hybrid jobs
  - Verify multi-contractor Job #19737: both rows show same margin
  - Verify Auto Notes (now col Y) still correct + includes margin breakdown
  - Verify Tracker slots (now Z-AN) still populated correctly
  - Verify Notes/Remarks (now col X) data preserved
- [ ] 4.4 — **Trigger February sync** — verify legacy layout works
- [ ] 4.5 — **Trigger April sync**
- [ ] 4.6 — **Trigger recurring syncs** (current-r, prev-r) — verify recurring tabs are untouched
- [ ] 4.7 — **Verify GTP tabs** refreshed correctly (correct data, no column misalignment)
- [ ] 4.8 — **Compare Dashboard** against Phase 0 baseline — totals should match
- [ ] 4.9 — **Compare Profitability** against Phase 0 baseline — margins should match
- [ ] 4.10 — **Check Cloud Run logs** for any errors or warnings
- [ ] 4.11 — **Resume all 4 Cloud Scheduler jobs**

### Gate 4
- [ ] All 4 sync modes complete without errors
- [ ] Margin values correct on 3+ spot-checked rows per tab (Feb, Mar, Apr)
- [ ] Multi-contractor margin correct on Job #19737
- [ ] GTP tabs show correct data
- [ ] Dashboard totals match baseline (within tolerance for new syncs that may have run)
- [ ] Profitability margins match baseline
- [ ] No data loss in any column
- [ ] Cloud Scheduler resumed and running
- [ ] Cloud Run logs clean

### Abort Condition
- If Dashboard or Profitability numbers are wrong → immediately deploy previous revision: `gcloud run services update-traffic kc-pp-sync --to-revisions=kc-pp-sync-00070-7xr=100`
- If data corruption detected → restore from backup sheet copy

---

## Phase 5: Conditional Formatting + Finalize
> Add green/yellow/red CF on column C. Clean up.

### Tasks
- [ ] 5.1 — Add CF rules to Feb, Mar, Apr tabs on column C (index 2), rows 2–500:
  - Green: ≥ 65%
  - Yellow: 40%–64.9%
  - Red: < 40%
- [ ] 5.2 — Format column C as percentage (numberFormat `"0.0%"`) on all 3 tabs
- [ ] 5.3 — Verify N/A cells don't trigger color (text values don't match numeric CF conditions)
- [ ] 5.4 — **Update docs:**
  - `CLAUDE.md` — update column layout documentation
  - `PROJECT-OVERVIEW.md` — mention margin column
  - `README.md` — update if needed
  - `constants.ts` comments — verify header arrays have correct column comments
- [ ] 5.5 — **Merge:** `git checkout master && git merge feat/margin-column`
- [ ] 5.6 — **Push:** `git push origin master`
- [ ] 5.7 — **Tag:** `git tag v3.1.0 -m "feat: per-row margin column (C)"`
- [ ] 5.8 — **Delete backup sheet** (or keep for 7 days, then delete)
- [ ] 5.9 — **Report to Nathan** with summary: margins working, sample values, screenshot or data dump

### Gate 5
- [ ] CF visible and correct on all 3 tabs
- [ ] N/A and blank cells uncolored
- [ ] Docs updated
- [ ] Master branch clean, pushed, tagged
- [ ] Nathan sees the margin column and confirms it looks right

---

## Execution Plan

| Phase | Who | How | Time Est |
|-------|-----|-----|----------|
| 0 | HQ | gog drive copy + git push + baseline capture | 5 min |
| 1 | HQ via DEV or direct | Sheets API insertDimension + verify | 10 min |
| 2 | HQ via Claude Code | Single-pass refactor of all column refs | 15-20 min |
| 3 | HQ via Claude Code | Margin calculation logic + tests | 15-20 min |
| 4 | HQ | Deploy + trigger syncs + verify | 15 min |
| 5 | HQ | CF rules + docs + merge + tag | 10 min |
| **Total** | | | **~60-75 min** |

---

## Rollback Plan

1. **Code rollback:** `git checkout master && git reset --hard origin/master`
2. **Cloud Run rollback:** `gcloud run services update-traffic kc-pp-sync --to-revisions=kc-pp-sync-00070-7xr=100 --region us-central1 --project aya-gservicies`
3. **Sheet rollback:** Copy data from backup sheet back to production sheet (or rename backup → production)
4. **Scheduler:** Resume if paused

---

## Abort Conditions (Global)
- If `insertDimension` corrupts data → STOP, restore from backup
- If >5 unexpected compile errors after refactor → STOP, review approach
- If Dashboard/Profitability numbers deviate from baseline → STOP, rollback deploy
- If recurring tab data is affected → STOP (should be impossible, but verify)
- If any gate fails twice → STOP, report to Nathan

## Assumptions
- Google Sheets `insertDimension` auto-shifts CF rules, dropdowns, and in-sheet references
- Existing data in columns C+ is preserved (shifted right) by Sheets API
- Recurring tabs are NOT touched — no column insert, no code changes
- Sheets API quota is sufficient for 3 column inserts + header writes
- Claude Code can handle a coordinated multi-file refactor with clear specs
