# TODO — kc-pp-sync

**Status:** ALL PHASES COMPLETE ✅

Last major work: 2026-04-10 (margin column, audit fixes, recurring GTP fix)

---

## Completed Sprints

### Audit Fix Sprint (2026-04-09)
Source: `AUDIT-2026-04-09.md`
- [x] Phase 1: Critical data bugs (H-1 through H-5) — all fixed
- [x] Phase 2: Structural fixes (dynamic tab discovery, single-pass recurring, tab guard)
- [x] Phase 3: Infrastructure cleanup (AR prune, SM prune, scheduler accepted)
- [x] Phase 4 partially: Tests written (61 total), stale comments updated

### Margin Column (2026-04-10)
Source: `TODO-margin-column.md`
- [x] Column C inserted on Feb/Mar/Apr one-off tabs (NOT recurring)
- [x] ~45 column references refactored across sheets.ts + function.ts
- [x] Margin calculation: payment-gated, multi-contractor aware, hybrid excluded
- [x] 10-band gradient CF on column C + Dashboard margin columns
- [x] C1 header = weighted average from Dashboard (not simple mean)
- [x] Dashboard CF upgraded to 10-band gradient (% Paid + margin columns)
- [x] 0% excluded from red CF band

### Recurring GTP Fix (2026-04-10)
- [x] `getDashboardColIndices()` split into 3 cases (recurring/legacy/new)
- [x] `extractGtpRows()` recurring parameter for correct column mapping
- [x] GTP read range for recurring: A2:V500 → A2:W500
- [x] March - R now contributes 10 GTP rows (was 0)
- [x] Col V CF fix endpoint for misplaced status rules

---

## Open / Deferred

- [ ] HeyPros label mutations (`jobLabelAttach "PAID BY CLIENT"`) — waiting for Nathan's approval
- [ ] No "prev-prev" scheduler mode — manual curl needed for 2+ months back
- [ ] Hybrid margin calculation — KC in-house labor cost not yet tracked
- [ ] VIP Email: high-urgency follow-ups posting as new top-level instead of threading
