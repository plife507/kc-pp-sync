# TODO: New Scheduler Architecture

## Status: PENDING

## Objective
Add two new sync modes and one new Cloud Scheduler job:
1. `dashboard` mode — refresh Dashboard + Profitability only, no Jobber/HeyPros calls
2. `all-prev` mode — sync all months older than current prev (Feb and older), including their `-R` tabs, then refresh dashboard
3. Fix: recurring syncs (`current-r`, `prev-r`) should also trigger a dashboard refresh after completion
4. Deploy updated Cloud Run + create 2 new scheduler jobs

---

## Phase 1: Add `dashboard` mode to resolveMode()

**File:** `src/config/env.ts`

**Task:** Add `"dashboard"` as a valid mode. It doesn't map to a tab name — it's a signal to the request handler. Return the string `"__dashboard__"` for mode `"dashboard"`.

```typescript
case "dashboard": return "__dashboard__";
```

Update the error message in `src/function.ts` (line ~781) to include the new valid modes:
```
Valid: current, current-r, prev, prev-r, dashboard, all-prev
```

**Gate:** `resolveMode("dashboard")` returns `"__dashboard__"`, `resolveMode("all-prev")` returns `"__all_prev__"`.

---

## Phase 2: Add `all-prev` mode to resolveMode()

**File:** `src/config/env.ts`

Add:
```typescript
case "all-prev": return "__all_prev__";
```

`all-prev` means: sync all one-off + recurring tabs for months that are OLDER than `previousMonthTabName()`. Discovery at runtime from sheet tab list.

**Gate:** `resolveMode("all-prev")` returns `"__all_prev__"`.

---

## Phase 3: Handle `__dashboard__` in function.ts request handler

**File:** `src/function.ts`

In the mode-resolution block (around line 779), after `config.sheets.sheetsTab = resolved`, add a check:

```typescript
if (resolved === "__dashboard__") {
  // Dashboard-only refresh — reuse the existing refreshDashboard block
  console.log("  Mode 'dashboard' → dashboard-only refresh");
  const dashCount = await refreshDashboard(config.sheets.spreadsheetId);
  await refreshProfitabilityDashboard(config.sheets.spreadsheetId);
  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  await logSyncResult(config.sheets.spreadsheetId, {
    timestamp: new Date().toISOString(),
    tab: "Dashboard",
    status: "✅ OK",
    jobs: dashCount,
    rows: 0,
    gtpRows: 0,
    elapsed: `${elapsed}s`,
    error: "",
  }).catch((e) => console.warn(`  Command log failed: ${e}`));
  res.status(200).json({ status: "ok", elapsed: `${elapsed}s`, mode: "dashboard", totalJobs: dashCount });
  return;
}
```

**Gate:** POST `{ "mode": "dashboard" }` returns `{ status: "ok", mode: "dashboard" }` without touching Jobber or HeyPros.

---

## Phase 4: Handle `__all_prev__` in function.ts request handler

**File:** `src/function.ts`

After the `__dashboard__` block, add an `__all_prev__` handler.

Logic:
1. Get all tab names from the spreadsheet (use existing `getSheetsClient` + `spreadsheets.get`)
2. Determine which months are "older than prev": all MONTH_NAMES months that exist as tabs AND are strictly older (lower index) than `previousMonthTabName()`. Exclude January.
3. For each older month (ascending order), sync the one-off tab then its `-R` tab sequentially:
   - One-off: call the existing sync flow with that tab name (reuse the main sync code path — set `config.sheets.sheetsTab = tabName` and call the sync function)
   - Recurring: set `config.sheets.sheetsTab = recurringTabName` and call the recurring sync path
   - Skip if tab doesn't exist in the sheet
4. After all months complete, run `refreshDashboard` + `refreshProfitabilityDashboard`
5. Log each tab sync to Command tab via `logSyncResult`
6. Return summary: `{ status: "ok", mode: "all-prev", monthsSynced: [...], totalJobs: N }`

**Important:** The existing sync logic is large and intertwined in the main request handler. The cleanest approach is to extract the sync logic into a helper function `syncTab(spreadsheetId, tabName, config)` that returns `{ jobCount, rowCount, gtpCount }`. Then both the normal path and `all-prev` can call it. If refactoring is too risky, an alternative is to make sequential HTTP self-calls to the same Cloud Run service (POST to `process.env.K_SERVICE_URL` with `{ tab: tabName }`).

**Preferred approach:** Self-call via HTTP (simpler, lower risk). Use `node-fetch` or built-in `fetch` to POST to `https://kc-pp-sync-<hash>-uc.a.run.app` (use `K_SERVICE_URL` env var which Cloud Run sets automatically, or derive from `CLOUD_RUN_URL` if set).

Self-call auth: Cloud Run requires auth. Use `google-auth-library` to get an ID token for the service URL:
```typescript
const { GoogleAuth } = await import("google-auth-library");
const auth = new GoogleAuth();
const client = await auth.getIdTokenClient(serviceUrl);
const response = await client.request({ url: serviceUrl, method: "POST", data: { tab: tabName } });
```

Log each self-call result. If any tab fails, log it but continue (don't abort all-prev).

**Gate:** POST `{ "mode": "all-prev" }` syncs February (and Feb-R) without errors, returns `{ status: "ok", mode: "all-prev" }`.

---

## Phase 5: Fix recurring syncs to trigger dashboard refresh

**File:** `src/function.ts`

Currently, when `isRecurringTab` is true, `dashboardCount` stays 0 and no dashboard refresh happens (line ~1178).

Fix: after a recurring sync completes successfully, call `refreshDashboard` + `refreshProfitabilityDashboard` and log the result. Same as what one-off tabs do.

Change:
```typescript
// BEFORE (recurring skips dashboard)
if (isRecurringTab) {
  // ... just syncs rows, no dashboard
}

// AFTER: at the end of recurring sync success path, add:
const dashCount = await refreshDashboard(config.sheets.spreadsheetId);
await refreshProfitabilityDashboard(config.sheets.spreadsheetId);
```

**Gate:** POST `{ "mode": "current-r" }` response includes `dashboardJobs > 0`.

---

## Phase 6: Build and deploy

```bash
cd /data/.openclaw/workspace/projects/kc-pp-sync
npm run build
# Verify 0 TypeScript errors
npm test
# Verify all tests pass

gcloud run deploy kc-pp-sync \
  --source . \
  --region us-central1 \
  --project aya-gservicies \
  --quiet
```

**Gate:** Deployment succeeds. Note new revision number.

---

## Phase 7: Create new Cloud Scheduler jobs

Two new jobs:

**Job 1: `kc-pp-sync-dashboard`**
- Schedule: `18,38,58 * * * *` (fires ~3 min after all 4 main syncs complete in each 20-min window)
- Body: `{"mode":"dashboard"}`
- Same service URL, same OIDC auth as existing jobs

**Job 2: `kc-pp-sync-older`**
- Schedule: `0 */4 * * *` (every 4 hours)
- Body: `{"mode":"all-prev"}`
- Same service URL, same OIDC auth

Use existing scheduler jobs as reference for OIDC service account and audience:
```bash
gcloud scheduler jobs describe kc-pp-sync-hourly --project aya-gservicies --location us-central1
```

Create:
```bash
gcloud scheduler jobs create http kc-pp-sync-dashboard \
  --location us-central1 \
  --schedule "18,38,58 * * * *" \
  --uri <SERVICE_URL> \
  --message-body '{"mode":"dashboard"}' \
  --oidc-service-account-email <SA_EMAIL> \
  --oidc-token-audience <SERVICE_URL> \
  --headers "Content-Type=application/json" \
  --project aya-gservicies

gcloud scheduler jobs create http kc-pp-sync-older \
  --location us-central1 \
  --schedule "0 */4 * * *" \
  --uri <SERVICE_URL> \
  --message-body '{"mode":"all-prev"}' \
  --oidc-service-account-email <SA_EMAIL> \
  --oidc-token-audience <SERVICE_URL> \
  --headers "Content-Type=application/json" \
  --project aya-gservicies
```

**Gate:** Both jobs created and visible in `gcloud scheduler jobs list`. Run `kc-pp-sync-dashboard` manually and confirm response.

---

## Phase 8: Verify end-to-end

1. Trigger `kc-pp-sync-dashboard` manually → confirm dashboard-only, fast response (<5s)
2. Trigger `kc-pp-sync-older` manually → confirm February + Feb-R sync, dashboard refresh
3. Trigger `kc-pp-sync-current-r` → confirm dashboard now refreshes after recurring sync
4. Check Command tab for all log entries

---

## Abort If
- `all-prev` self-call auth fails and can't be fixed quickly → report to Nathan, keep existing scheduler approach
- TypeScript refactor for syncTab introduces test failures → revert, use self-call approach instead
- Any existing test breaks

## Final Scheduler Layout

| Job | Schedule | Mode | Covers |
|-----|----------|------|--------|
| kc-pp-sync-hourly | `*/20 * * * *` | current | April |
| kc-pp-sync-recurring | `5,25,45 * * * *` | current-r | April - R + dashboard |
| kc-pp-sync-prev-month | `10,30,50 * * * *` | prev | March |
| kc-pp-sync-prev-recurring | `15,35,55 * * * *` | prev-r | March - R + dashboard |
| kc-pp-sync-dashboard *(new)* | `18,38,58 * * * *` | dashboard | Dashboard only |
| kc-pp-sync-older *(new)* | `0 */4 * * *` | all-prev | Feb + Feb-R + older |
