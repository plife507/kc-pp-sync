# KC PP Sync — Project Overview

## Goal
Automate KC Power Clean's cross-system operations by syncing data between **Jobber** (job management, invoicing, payments) and **HeyPros** (subcontractor dispatch, labels, sub-invoices), with **Google Sheets** as the output layer and **GCloud** as the production host.

## The Problem
Nathan manually tracks subcontractor invoices across two disconnected platforms. When a client pays on Jobber, someone has to go update labels in HeyPros and maintain a spreadsheet with 22+ columns. At 100-200 jobs/month, this doesn't scale.

## The Solution
A scheduled sync job that:
1. Pulls paid invoices from **Jobber** (incremental — only what changed since last run)
2. Matches them to work orders in **HeyPros** via Job # = WO#
3. Pulls sub-invoice data from HeyPros (invoice #, amount, status)
4. Outputs to **Google Sheets** (mirrors the existing Sub Invoices sheet structure)
5. Eventually: auto-labels HeyPros jobs ("PAID BY CLIENT") via mutation API

## Systems Connected

| System | Access | What We Pull |
|---|---|---|
| **Jobber** | GraphQL API, OAuth 2.0 | Invoices, payment status, client name, amounts, dates |
| **HeyPros** | GraphQL API, email/password auth | Jobs, labels, sub-invoices, contractor info |
| **Google Sheets** | Sheets API via gcloud | Output target — mirrors Sub Invoices sheet |
| **GCloud** | Cloud Run Job (planned) | Scheduled execution, secrets, $0/month |

## Current State

### ✅ Done
- Jobber CLI deployed on VPS with OAuth auto-refresh (6h cron)
- Jobber API: query paid invoices by date range, filter by status, full pagination
- HeyPros API: fully mapped (197 types), all 319 WOs accessible, label mutations documented
- Cross-system matching: Jobber Job # = HeyPros WO# (purchaseOrder) — verified with live data
- Real Jobber adapter with self-contained OAuth token refresh
- HeyPros adapter with token caching + rate protection (hardwired best practices)
- POC sheet created with real data from both APIs
- 7/7 unit tests passing
- Project renamed from payment-sync → kc-pp-sync

### ✅ Done (updated 2026-03-21)
- Multiple HeyPros jobs per WO#: one row per HeyPros ID, round-robin assignment — commit d828dc5
- Multi-invoice selection: highest invoice number for both Jobber and HeyPros — commit d828dc5
- HeyPros invoice fields: invoice #, sub-invoice amount, PDF URL in sheet — implemented
- Full 24-column sheet structure matched (A–X)
- Job Type column (G) added — commit 98ee3a7
- Cloud Function deployed (gen2, us-central1): kc-pp-sync-00011-cof, ACTIVE
- Cloud Scheduler: hourly at `0 * * * *` UTC
- 38/38 tests passing
- HeyPros ID normalization utility: normalizeHashidNumeric() — commit f70514c

### 📋 Open
- Recurring job edge case: same WO# reused across months accumulates many invoices; needs date-range filter or dedup strategy. Deferred.
- Prod deploy config: still using test sheet ID and SYNC_LOOKBACK_DAYS=20
- Cloud Function has no failure alerting — silent on auth/write errors
- HeyPros label mutations (jobLabelAttach "PAID BY CLIENT"): deferred until Nathan approves writes

### 🔒 Constraints
- HeyPros: read-only until Nathan approves mutations
- HeyPros: max 1 signIn per 15 min, 250ms between queries, no auth retries
- Jobber: 2,500 requests per 5 min (not close to hitting)
- Jobber WO# is NOT unique in HeyPros (duplicate WO 19699 — matcher handles this)
- GCloud free tier only — $0/month target

## Architecture

```
Cloud Scheduler (hourly)
  → Cloud Run Job (kc-pp-sync container)
    → Jobber API: "What invoices were paid since last sync?"
      (5-20 results per day, incremental)
    → HeyPros API: Look up those WO#s + get sub-invoice data
      (5-20 targeted lookups, not full scan)
    → Google Sheets: Write/update rows
    → Optional: HeyPros jobLabelAttach("PAID BY CLIENT")
    → Exit
```

## Key Files
- `src/adapters/jobber.ts` — Jobber API with self-contained OAuth refresh
- `src/adapters/heypros.ts` — HeyPros API with token caching + rate protection
- `src/adapters/sheets.ts` — Google Sheets writer
- `src/core/matcher.ts` — Job# → WO# matching with duplicate handling
- `src/config/env.ts` — Environment config
- `src/index.ts` — CLI entrypoint

## API Authority

### HeyPros API
Canonical technical contracts live in `projects/heypros-api/` — a standalone reference library.
This project consumes it; do not duplicate field contracts here.

Key references:
- `projects/heypros-api/schema/schema-map.md` — complete HeyPros API map
- `projects/heypros-api/references/heypros-job-card-schema.md` — full JobDto field reference
- `projects/heypros-api/references/field-contract-*.md` — per-type field contracts
- `projects/heypros-api/references/runtime-guardrails-readonly.md` — auth + rate-limit rules
- `projects/heypros-api/references/label-mutations-investigation-2026-03-20.md` — label CRUD (future write work)
- `projects/heypros-api/references/edge-case-full-sweep-2026-03-20.md` — edge case evidence
- `projects/heypros-api/queries/` — verified GraphQL query library
- See `references/HEYPROS-API-AUTHORITY.md` for the full reference map

### Jobber API
Lives inside this project — no separate Jobber API project.
- `src/adapters/jobber.ts` — live Jobber GraphQL adapter with OAuth auto-refresh
- `references/jobber-schema/` — Jobber introspection snapshot
- Auth: OAuth 2.0 via JOBBER_CLIENT_ID / JOBBER_CLIENT_SECRET / JOBBER_REFRESH_TOKEN (Secret Manager)

### Browser-efficiency projects
`projects/browser-efficiency/` and `projects/global-browser-efficiency/` are separate browser automation doctrine projects. They are NOT part of kc-pp-sync. Do not merge.

### GCloud
- Project: `aya-gservicies` (current sandbox/build)
- Prod direction: dedicated project when integration matures (see `docs/gcloud-sandbox-policy.md`)
