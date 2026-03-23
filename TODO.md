# TODO.md — KC PP Sync

Status: live — source-sheet mode active, hourly schedule running
Project: Jobber → HeyPros → Google Sheets sync (kc-pp-sync Cloud Function)
Branch: feat/payment-sync-test-mode
Last updated: 2026-03-21

## Objective
Sync Jobber paid invoices to HeyPros work orders and write results to Google Sheets.
Primary mode: source-sheet driven (reads Job#s from sheet column F, updates auto columns only).

## Phase Status
- [x] Phase 0 — Contract, scope, and project scaffold
- [x] Phase 1 — Core implementation and tests (38/38 passing)
- [x] Phase 2 — Live verification and handoff
  - Live HeyPros auth resolved (v2 credentials in Secret Manager)
  - Cloud Function deployed: kc-pp-sync-00011-cof (ACTIVE)
  - Live test: 326 HeyPros jobs, 815 Jobber invoices, 836 rows written
  - Spot-check 10/10 exact match

## Open Items

### Data quality
- [ ] **Recurring job edge case** — same WO# over many months accumulates invoices beyond sync window. Needs date-range filter or dedup strategy. Deferred until Nathan provides example.

### Infrastructure
- [ ] **Cloud Function failure alerting** — no notification on auth/write errors. Silent failure in prod.
- [ ] **Job Type (col G) live validation** — added (98ee3a7) but not spot-checked against live Jobber API.
- [ ] **Client Name (col H) live validation** — present in mapping, not yet confirmed against live sheet.
- [ ] **Prod deploy config** — test sheet ID + SYNC_LOOKBACK_DAYS=20 still active. Need prod env vars, confirm Sheets IAM, then cut over.

### Code quality
- [ ] **HeyPros label mutations (PAID BY CLIENT)** — read-only for now. Deferred until Nathan approves writes.

## API Authority
HeyPros API technical contracts live in `projects/heypros-api/`.
Jobber API lives inside this project (`src/adapters/jobber.ts` + `references/jobber-schema/`).
See `references/HEYPROS-API-AUTHORITY.md` for the full reference map.

## Key Commands
```bash
npm test          # 38 tests
npm run build     # tsc compile
```

## Key Files
- `src/function.ts` — Cloud Function entry point (source-sheet + date-range modes)
- `src/adapters/jobber.ts` — Jobber GraphQL + OAuth refresh
- `src/adapters/heypros.ts` — HeyPros GraphQL auth + rate guards
- `src/adapters/sheets.ts` — Google Sheets read/write
- `src/core/matcher.ts` — Jobber Job# ↔ HeyPros WO# matching
- `src/config/types.ts` — shared types + normalizeHashidNumeric()
