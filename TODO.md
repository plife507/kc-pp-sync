# TODO — kc-pp-sync Audit Fix Sprint

**Created:** 2026-04-09  
**Source:** `AUDIT-2026-04-09.md` + live investigation  
**Status:** PHASES 1–3 COMPLETE

---

## Phase 1 — Critical Data Bugs (Deploy Together)

> These are broken RIGHT NOW and producing wrong numbers on the Dashboard.

### 1.1 Fix `MONTHS_TO_SCAN` hardcoded `"February 2026"` → `"February"`
- **File:** `sheets.ts` → `refreshProfitabilityDashboard()` line ~949
- **Bug:** `oneOffTab: "February 2026"` but tab was renamed to `"February"` today
- **Impact:** February one-off completely missing from profitability. Dashboard shows $0 rev / $0 labor for Feb one-off. (Feb - R still works because `recurringTab: "Feb - R"` is correct.)
- **Fix:** Changed `oneOffTab: "February 2026"` → `oneOffTab: "February"`. Then replaced with dynamic discovery in Phase 2.
- **Verify:** Feb one-off now shows $113,010 rev / $28,219 labor / 75.0% margin ✅
- [x] Fixed (commit 2059b95, Phase 1)
- [x] Superseded by dynamic discovery (commit 2bba3da, Phase 2)
- [x] Verified

### 1.2 Fix `getDashboardColIndices()` for legacy tabs without year suffix
- **File:** `sheets.ts` → `getDashboardColIndices()` line ~480
- **Bug:** Regex `/^\w+\s+\d{4}$/` doesn't match `"February"` (no year suffix). Falls through to new-layout indices (paymentStatus=18, subInvoiceAmount=15, allPaid=13). Correct legacy indices are paymentStatus=20, subInvoiceAmount=17, allPaid=14.
- **Impact:** February dashboard row shows:
  - `Total $ = $289.00` — JS `parseFloat("2/3/2026")` → 2, summed across 133 date cells
  - `# Blank = 136` — col 18 (KCPC Released Amount) read as Payment Status, all blank
  - Every other stat (Paid, GTP, Hold, NCP) = 0
- **Evidence:** Verified col 15 = "Date Invoice Paid" (date strings), col 18 = "KCPC Released Amount" (mostly blank)
- **Fix:** Replaced standalone regex with `isNewLayout()` call
- **Verify:** February dashboard: Total $40,404 / 131 GTP / 1 On Hold / 1 Pending / 1 Blank ✅
- [x] Fixed (commit 2059b95)
- [x] Verified

### 1.3 Fix Dashboard paid status — use only Payment Status column
- **File:** `sheets.ts` → `refreshDashboard()` line ~609
- **Bug:** `if (statusLower === "paid" || isPaid)` — `isPaid` checks AllPaid column (✅ = client paid Jobber invoice). This catches rows where Payment Status = "Good to Pay" and misclassifies them as "Paid".
- **Impact:** March shows `# Paid = 216, # Good to Pay = 0`. Reality: ALL 184 ✅ rows have Payment Status = "Good to Pay" (KC hasn't released sub payment yet). Zero rows have Payment Status = "Paid".
- **Decision:** Payment Status column is the source of truth for the dashboard. AllPaid (client payment) is already visible in the sheet. Dashboard tracks **sub payment** status.
- **Fix:** Removed `|| isPaid`. Dashboard uses only Payment Status column.
- **Verify:** March: Paid=0, GTP=216 (was Paid=216, GTP=0) ✅
- [x] Fixed (commit 2059b95)
- [x] Verified

### 1.4 Fix profitability: only count labor when client has paid
- **File:** `sheets.ts` → `refreshProfitabilityDashboard()`
- **Nathan's rule:** Only count labor when client has paid. If client hasn't paid, we can't book that expense against revenue.
- **Current behavior:** Labor counted for ALL invoiced rows regardless of client payment
- **New behavior:** Labor counted ONLY when:
  - New layout: `AllPaid (col N) === "✅"`
  - Legacy layout: `InvoiceStatus (col O) === "Paid"`
  - Recurring: `InvoiceStatus (col O) === "Paid"`
- **Multi-contractor handling:** AllPaid is the same for all rows of a multi-contractor job (it's per-Jobber-job, not per-sub). Revenue already deduped by Job# (new) or Invoice# (legacy). Labor is per-row (each sub has different amount) — no dedup needed. When AllPaid=✅, all subs' labor counted. When AllPaid=❌, none counted. This is correct.
- **Impact on current numbers:**

  | Month | Current Labor | Paid-Only Labor | Excluded |
  |-------|-------------|----------------|----------|
  | February (one-off) | $40,604 | $39,764 | $840 |
  | March (one-off) | $77,193 | $70,373 | $6,820 |
  | March (hybrid) | $16,434 | $10,084 | $6,350 |
  | March (recurring) | $7,200 | $5,265 | $1,935 |
  | April (one-off) | $18,075 | ~$16,260 | ~$1,815 |

  Margins will INCREASE because labor goes down while revenue stays the same.

- **Code changes (3 places):**
  1. **Legacy one-off** (~line 1031): Add `if (invStatus.toLowerCase() === "paid")` gate before counting labor
  2. **New layout one-off** (~line 1073): Add `if (allPaid === "✅")` gate before counting labor
  3. **Recurring** (~line 1121): Add `if (invStatus.toLowerCase() === "paid")` gate before counting labor
- **NCP edge case:** NCP jobs (AllPaid=❌, PayStatus="NO CLIENT PAY") will have $0 labor AND $0 revenue in profitability. They're tracked in # Excluded count. This is correct — if client didn't pay, the margin calculation shouldn't include that job.
- **# Excluded column:** Now counts rows excluded from BOTH revenue AND labor. Notes updated.
- [x] Fixed legacy (commit 2059b95)
- [x] Fixed new layout (commit 2059b95)
- [x] Fixed recurring (commit 2059b95)
- [x] Methodology notes updated (commit 2059b95)
- [x] Verified: Mar one-off labor $77,193→$70,373, recurring $7,200→$5,265, margins up

### 1.5 Fix `parseDollarAmount()` to reject date strings
- **File:** `sheets.ts` → `parseDollarAmount()`
- **Bug:** JS `parseFloat("2/3/2026")` → `2` (stops at first non-numeric char). Date strings parsed as dollar amounts produce garbage.
- **Evidence:** February `Total $ = $289.00` = sum of month numbers from 133 date cells
- **Fix:** After parseFloat, validate the full cleaned string is numeric: `/^[\d,.]+$/.test(cleaned)`. If not, return 0.
- **This prevents H-2 from silently corrupting data even if column detection breaks again.**
- [x] Fixed (commit 2059b95)

---

## Phase 2 — Structural Fixes (Deploy After Phase 1 Stable)

### 2.1 Unify legacy layout detection into single function
- **Files:** `sheets.ts` — all 4 detection sites
- **Problem:** `getDashboardColIndices()` uses its own regex instead of `isNewLayout()`. Caused H-2.
- **Fix:** All paths call `isNewLayout()` as single source of truth. Duplicate regex removed.
- [x] Fixed (commit 2059b95, Phase 1)
- [x] Verified

### 2.2 Auto-discover month tabs in profitability dashboard
- **File:** `sheets.ts` → `refreshProfitabilityDashboard()`
- **Problem:** Hardcoded `MONTHS_TO_SCAN` array. Adding a month or renaming a tab requires code change. Caused H-1.
- **Fix:** Dynamic tab discovery implemented. Scans spreadsheet metadata, handles bare names and year suffixes, maps recurring tab abbreviations.
- [x] Fixed (commit 2bba3da)
- [x] Verified: All profitability numbers unchanged after switch to dynamic discovery

### 2.3 Clean up recurring revenue dedup dead code
- **File:** `sheets.ts` → `refreshProfitabilityDashboard()` recurring section
- **Bug:** First pass adds invoiceNum to set THEN checks `.has()` → always true → dead code. Second pass handles it correctly.
- **Fix:** Merged into single-pass loop. Dead first-pass code removed.
- [x] Fixed (commit 2bba3da)

### 2.4 Add GTP tab sync guard
- **File:** `function.ts` → main handler
- **Problem:** GTP/Dashboard/Command tabs crash when passed as sync target.
- **Fix:** Early 400 return with clear error message for GTP/Dashboard/Command tabs.
- [x] Fixed (commit 2bba3da)
- [x] Verified: `{"status":"error","error":"Tab ... is a derived/system tab and cannot be synced directly."}`

---

## Phase 3 — Infrastructure Cleanup (CLI Only, No Deploy)

### 3.1 Prune Artifact Registry stale images
- **Current:** 22 images in `gcf-artifacts`, ~32MB each = ~700MB (free tier: 500MB)
- **Fix:** Delete all untagged images. Keep `latest` + 2 most recent by date.
- **Command:** `gcloud artifacts docker images delete <image>@<digest> --delete-tags --quiet`
- [x] Pruned: 26 images → 1 (latest only). ~832MB → ~32MB.
- [x] Verified < 500MB

### 3.2 Prune Secret Manager old versions
- **Current:** 10 secrets, ~13 versions. Free tier: 6 active.
- **Fix:** Destroyed 4 disabled versions (HEYPROS_EMAIL/1, HEYPROS_PASSWORD/1, VIP_SLACK_CHANNEL_ID/1+2).
- [x] Pruned: 13 versions → 10 (all enabled)

### 3.3 Cloud Scheduler — accept $0.20/month
- **Current:** 5 jobs (3 free). $0.20/month for 2 extra.
- **Decision:** Keep all 5. Not worth consolidation complexity.
- [x] Accepted

---

## Phase 4 — Quality & Resilience

### 4.1 Add basic test coverage
- **Files:** `test/` directory (create)
- **Tests:**
  - `isNewLayout()` — all tab patterns
  - `getDashboardColIndices()` — correct indices per type
  - `parseDollarAmount()` — currency, dates (=0), blanks
  - `formatHeyProsId()` — digit lengths
- [ ] Tests written
- [ ] Tests passing

### 4.2 Update stale comments and methodology notes
- `isNewLayout()` — mention "February" (no year) as legacy
- `refreshProfitabilityDashboard()` notes — reflect paid-only labor rule
- `RECURRING_AUTO_COL_LETTERS` — fix comment about col A
- [ ] Fixed

---

## Execution Plan

| Phase | Scope | Deploy? | Estimated |
|-------|-------|---------|-----------|
| 1 | 5 items, all affect Dashboard output | Yes — single revision | 1 session |
| 2 | 4 items, structural cleanup | Yes — separate revision | 1 session |
| 3 | AR prune, SM prune | No deploy | 10 min CLI |
| 4 | Tests + comments | Yes — separate revision | 1 session |

**Phase 1 is the critical path.** Everything else depends on Phase 1 being stable first.

**Gate:** After Phase 1 deploy, compare Dashboard + Profitability output against manual counts from sheets. All numbers must match before proceeding.
