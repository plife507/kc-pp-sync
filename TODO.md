# TODO: kc-pp-sync — Open Work

## Status Summary (2026-04-06)
All production hardening phases (1-4) complete. Dashboard live. Profitability dashboard live.
Current revision: kc-pp-sync-00053-hg4

---

## Open: Remaining Balance Column

**Goal:** Add "Remaining Balance to Pay" column = Sub Invoice Amount − KCPC Released Amount

**Status:** Paused — Nathan requested, deferred pending scope clarification
- Formula scope: new layout only (col P − col Q) or also legacy (col R − col S)?
- Blank handling: show $0, blank, or formula only when both columns populated?
- Position: new column added to layout or computed in existing space?

**Waiting on:** Nathan to confirm scope before implementation.

---

## Open: Manual Sync Button Install

**Phase 3 gates not yet verified:**
- [ ] Install `apps-script/sync-button.gs` in spreadsheet (Extensions → Apps Script → paste)
- [ ] Grant Apps Script SA Cloud Run Invoker role in IAM
- [ ] Test: click button → sync runs → sheet updates visible

Script is written and saved. Auth path uses `ScriptApp.getIdentityToken()` (OIDC).

---

## Open: May Rollover Verification

- [ ] Verify May 1 auto-rollover: `mode=current` → "May", `mode=prev` → "April"
- [ ] No manual Cloud Scheduler updates needed (auto-derives from current date)

---

## Deferred: HeyPros Label Mutations

- `jobLabelAttach "PAID BY CLIENT"` — read-only until Nathan approves writes
- API is fully mapped and ready (see `references/HEYPROS-API-AUTHORITY.md`)

---

## Deferred: Feb - R Scheduler

- [ ] Add Feb - R to Cloud Scheduler if it still needs periodic sync
- Currently: Feb - R only syncs on manual trigger or `prev-r` mode

---

## Completed Phases (reference)

| Phase | Description | Revision |
|---|---|---|
| 1 | Jobber token rotation via Secret Manager | kc-pp-sync-00039-q5n |
| 2 | Auto month rollover (mode parameter) | kc-pp-sync-00039-q5n |
| 3 | Manual sync button (Apps Script) | kc-pp-sync-00040-ntv |
| 4 | Failure alerting + prev-month bug fix | kc-pp-sync-00042-l2b |
| 5 | Dashboard tab (payment status) | kc-pp-sync-00050+ |
| 6 | Profitability dashboard | kc-pp-sync-00053-hg4 |
