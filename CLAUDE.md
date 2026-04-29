# CLAUDE.md — KC PP Sync

Last updated: 2026-04-29

This is the working guide for coding agents. Keep it short and operational; README is the human/operator reference.

## Service Shape

- Cloud Run service: `kc-pp-sync`
- Project/region: `aya-gservicies` / `us-central1`
- Runtime target: `kcPPSync` from `dist/function.js`
- Spreadsheet: `KC PP Sync` (`1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`)
- Deploy command: `gcloud run deploy kc-pp-sync --source . --region us-central1 --project aya-gservicies --no-allow-unauthenticated`
- `gcp-build` must stay `true`; `dist/` is committed and deployed.

Use `gcloud run services describe`, `gcloud run revisions list`, and `gcloud scheduler jobs list` for live state. Do not hardcode current revision numbers in docs.

## Commands

```bash
npm run build
npm test
npm run local
```

Current suite: 62 tests in `test/output-sheet.test.ts`.

## Source Map

- `src/function.ts` — HTTP handler, sync modes, orchestration, margin computation.
- `src/adapters/sheets.ts` — Google Sheets reads/writes, GTP, Dashboard, profitability, CF, sync log.
- `src/adapters/jobber.ts` — Jobber GraphQL + OAuth Secret Manager refresh.
- `src/adapters/heypros.ts` — HeyPros auth/cache + paginated job fetch.
- `src/config/constants.ts` — headers and layout maps.
- `src/config/env.ts` — runtime config, secrets, mode resolution.
- `apps-script/sync-button.gs` — active in-sheet manual sync menu.
- `scripts/gcloud-cleanup.sh` — active dry-run-first cleanup helper.

Deprecated one-time tab/Command helpers were removed. Do not reintroduce hardcoded month setup scripts unless they are generated from current layout constants and clearly scoped.

## Sync Inputs

The handler accepts either mode or exact tab targeting:

- `{"mode":"current"}` — current month one-off.
- `{"mode":"current-r"}` — current month recurring.
- `{"mode":"prev"}` — previous month one-off.
- `{"mode":"prev-r"}` — previous month recurring.
- `{"mode":"dashboard"}` — dashboard/profitability refresh only.
- `{"mode":"all-prev"}` — older one-off tabs before previous month.
- `{"tab":"April"}` or `{"tab":"April - R"}` — exact tab sync.

Reject direct syncs for generated/internal tabs such as `Dashboard`, `Log`, `⚡ Command`, and `* - GTP $`.

## Layout Rules

There are three real source-tab layouts:

| Layout | Examples | Columns | Margin C? | Manual driver |
|---|---|---:|---|---|
| New one-off | `March`, `April`, `May` | 40, A-AN | yes | Job # in G |
| Legacy one-off | `February` | 27, A-AA | yes | Job # in G |
| Recurring | `March - R`, `April - R` | 26, A-Z | no | Job # in F, Invoice # in L |

Recurring tabs do not have margin column C. Any column read/write logic must branch on new one-off, legacy one-off, and recurring. `isNewLayout()` is the source of truth for one-off layout detection. `assertSourceTabLayout()` must run before source-tab syncs so future templates like hidden `May` cannot be synced with shifted columns.

Do not prebuild future months for the rest of the year. Create the next month only during rollover from the latest known-good one-off, recurring, and GTP layouts, then validate headers before running syncs.

Manual columns must never be overwritten:

- New one-off: B, G, R, T, U, V, W, X
- Legacy one-off: B, G, T, V, W, X, Y, Z
- Recurring: B, F, L, S, U, V, W, X, Y

## Generated Outputs

- `GTP $` tabs merge one-off + recurring rows that are paid, Good to Pay, and awaiting payment.
- `Dashboard` merges month-level payment/profitability metrics and excludes January from YTD dashboard totals.
- `Log` receives sync entries: timestamp, tab, status, jobs, rows, GTP rows, elapsed, error.
- `⚡ Command` is the in-sheet UI, not the sync log.

## Business Cautions

- HeyPros `purchaseOrder` is not unique; shared PO/job numbers can be legitimate.
- HeyPros amounts are cents; divide by 100.
- HeyPros `jobsDashboard` did not return archived jobs in the 2026-04-14 verification.
- Jobber `searchTerm` is fuzzy; filter exact matches client-side.
- Jobber `receivedDate` is the paid date.
- Hybrid margin logic is intentionally blank unless a future labor-cost model is approved.
- HeyPros writes are out of scope unless Nathan explicitly approves them.

## May 2026 Prep

Live sheet state observed 2026-04-29: hidden `May` exists but has 39 visible columns and no margin column C, hidden `May - GTP $` exists, and `May - R` is missing. Future June-December hidden tabs are stale prebuilt templates and should be removed after verifying they contain no live rows. Before enabling May sync traffic, repair `May` to the March/April 40-column visible layout, create `May - R` from the recurring layout, unhide needed tabs, then refresh Dashboard/profitability.

## Before Finishing Code Work

1. Run `npm run build`.
2. Run `npm test`.
3. Inspect `git diff --stat` and relevant diffs.
4. If runtime behavior changed, verify Cloud Run/Scheduler/logs after deploy.
5. Keep docs current but avoid stale live revision numbers.
