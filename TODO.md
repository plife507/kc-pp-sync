# TODO: kc-pp-sync Production Hardening

## Phase 1: Jobber Token Rotation Fix 🔴
**Goal:** Ensure Jobber auth survives cold starts after refresh token rotation.

### Tasks
- [ ] Update `jobber.ts` `persist()` to write rotated refresh token back to Secret Manager
- [ ] Add `@google-cloud/secret-manager` dependency
- [ ] Test: force token refresh → verify Secret Manager updated → simulate cold start
- [ ] Deploy and verify with live sync

### Gate
- [ ] Cold start after token rotation uses new refresh token from Secret Manager
- [ ] No auth failures in Cloud Run logs across 3+ sync cycles

---

## Phase 2: Auto Month Rollover 🟡
**Goal:** Eliminate hardcoded tab names in Cloud Scheduler. Function auto-derives all tab names.

### Tasks
- [ ] Add `previousMonthTabName()` helper (e.g., in April → returns "March")
- [ ] Update `kcPPSync()` to accept `mode` parameter: `current`, `current-r`, `prev`, `prev-r`
- [ ] Update 4 Cloud Scheduler jobs to use `mode` instead of hardcoded `tab` names
- [ ] Test: verify each mode resolves to correct tab name
- [ ] Deploy and update scheduler bodies

### Gate
- [ ] All 4 scheduler jobs use `mode` parameter, zero hardcoded tab names
- [ ] May rollover happens automatically with no manual intervention

---

## Phase 3: Manual Sync Button 🟡
**Goal:** Nathan/team can trigger on-demand sync from Google Sheets.

### Tasks
- [ ] Create Apps Script sidebar or custom menu in KC PP Sync spreadsheet
- [ ] Script calls Cloud Run URL with `{tab: <active tab name>}` via UrlFetchApp
- [ ] Add auth (OIDC service account token or shared secret header)
- [ ] Add "Sync Now" button for current tab + "Sync All" for full refresh
- [ ] Test: click button → sync runs → sheet updates visible

### Gate
- [ ] Non-technical user can trigger sync from spreadsheet menu
- [ ] Auth prevents unauthorized triggers
- [ ] Button works for any tab (monthly, recurring, or specific)

---

## Phase 4: Failure Alerting 🟢
**Goal:** Sync failures notify the team proactively.

### Tasks
- [ ] Add Slack webhook notification on sync error (POST to ops channel)
- [ ] Include error message, tab name, elapsed time in alert
- [ ] Optional: daily summary of sync health (success count, avg time)

### Gate
- [ ] Simulated failure triggers Slack alert within 60 seconds
- [ ] Alert contains enough info to diagnose without checking Cloud Run logs

---

## Phase 5: Cleanup 🟢
- [ ] Add Feb - R to scheduler if still needs periodic sync
- [ ] Remove any stale Cloud Scheduler jobs
- [ ] Verify all 10+ GTP $ tabs have correct CF/dropdowns/headers (done 2026-04-03)
- [ ] Update kc-pp-sync-reference.md with final production state

---

## Constraints
- No Claude Code dependency — all work via direct edits or DEV
- Zero downtime — deploy incrementally, verify each phase
- Free tier awareness — Secret Manager writes count toward 10K/month limit
