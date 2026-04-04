# TODO: kc-pp-sync Production Hardening

## Phase 1: Jobber Token Rotation Fix 🔴
**Goal:** Ensure Jobber auth survives cold starts after refresh token rotation.

### Tasks
- [x] Update `jobber.ts` `persist()` to write rotated refresh token back to Secret Manager
- [x] Used googleapis ADC + REST API (no extra SDK dependency needed)
- [x] Deploy and verify with live sync (revision kc-pp-sync-00039-q5n)
- [ ] Test: force token refresh → verify Secret Manager updated → simulate cold start

### Gate
- [ ] Cold start after token rotation uses new refresh token from Secret Manager
- [ ] No auth failures in Cloud Run logs across 3+ sync cycles

---

## Phase 2: Auto Month Rollover 🟡
**Goal:** Eliminate hardcoded tab names in Cloud Scheduler. Function auto-derives all tab names.

### Tasks
- [x] Add `previousMonthTabName()` helper (e.g., in April → returns "March")
- [x] Add `resolveMode()`: current, current-r, prev, prev-r → tab names
- [x] Update `kcPPSync()` to accept `mode` parameter with validation
- [x] Update 4 Cloud Scheduler jobs to use `mode` instead of hardcoded `tab` names
- [x] Test: mode=current → "April" ✅, mode=current-r → "April - R" ✅
- [x] Deploy (kc-pp-sync-00039-q5n) and scheduler bodies updated

### Gate
- [x] All 4 scheduler jobs use `mode` parameter, zero hardcoded tab names
- [ ] May rollover happens automatically with no manual intervention (verify May 1)

---

## Phase 3: Manual Sync Button 🟡
**Goal:** Nathan/team can trigger on-demand sync from Google Sheets.

### Tasks
- [x] Create Apps Script custom menu "⚡ KC PP Sync" in spreadsheet
- [x] Script calls Cloud Run URL with `{tab: <name>}` or `{mode: <mode>}` via UrlFetchApp
- [x] Auth via `ScriptApp.getIdentityToken()` (OIDC)
- [x] "Sync Current Tab", "Sync All Active", individual month/recurring options
- [x] Toast notifications during sync, alert dialog with results
- [x] Code saved to `apps-script/sync-button.gs`
- [ ] Install in spreadsheet (Extensions → Apps Script → paste code)
- [ ] Grant Apps Script SA Cloud Run Invoker role in IAM
- [ ] Test: click button → sync runs → sheet updates visible

### Gate
- [ ] Non-technical user can trigger sync from spreadsheet menu
- [ ] Auth prevents unauthorized triggers
- [ ] Button works for any tab (monthly, recurring, or specific)

---

## Phase 4: Failure Alerting 🟢
**Goal:** Sync failures notify the team proactively.

### Tasks
- [x] Add Telegram alert to AYA MC command tab (topic:1) on sync exception
- [x] TELEGRAM_BOT_TOKEN stored in Secret Manager, mounted in Cloud Run
- [x] Alert includes tab name, elapsed time, error message (500 char limit)
- [x] Non-blocking — alert errors don't affect sync response
- [x] Deployed: kc-pp-sync-00040-ntv
- [ ] Optional: daily summary of sync health (success count, avg time)

### Gate
- [x] Alert code deployed and compiled
- [x] Bot token verified in Cloud Run env
- [ ] Will verify on next real failure (empty tab syncs don't crash — correct behavior)

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
