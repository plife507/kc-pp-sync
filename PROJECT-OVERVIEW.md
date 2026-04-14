# KC PP Sync — Project Overview

## Goal
Sync Jobber client-payment data and HeyPros subcontractor data into the KC PP Sync spreadsheet, then keep payment, GTP, and profitability views current with minimal manual work.

## Production shape
- **Runtime:** Google Cloud Run (`kc-pp-sync`)
- **Triggers:** Cloud Scheduler
- **Output:** Google Sheets (`KC PP Sync`)
- **Sources:** Jobber GraphQL + HeyPros GraphQL

## What the system does
- syncs current and previous month one-off + recurring tabs
- matches HeyPros work orders to Jobber jobs through `purchaseOrder`
- handles multi-value PO fields and multi-invoice cases
- writes one row per matched HeyPros WO
- refreshes Dashboard and GTP outputs
- logs sync runs to the Command tab

## Important current behavior
- Archived HeyPros jobs are **not currently returned** by the `jobsDashboard` API response we tested on 2026-04-14.
- Completed/closed work **is returned** as `Done`.
- Duplicate PO/job-number returns exist in HeyPros, but many are legitimate recurring or multi-work-order patterns.
- The project remains effectively **read-only** against HeyPros unless Nathan explicitly approves writes.

## Current status
- production is live and stable enough for normal use
- README is the main operator doc
- tests are green
- repo is synced with GitHub

## Active caution areas
- duplicate WO/PO patterns should be treated as business-shape data first, not assumed bugs
- Jobber and HeyPros assumptions should be re-verified before future matching logic changes
- keep markdown docs lean so they reflect current truth, not old implementation ceremony

## Canonical docs
- `README.md` — main system/operator reference
- `TODO.md` — only active or deferred work
- `AUDIT-2026-04-09.md` — historical audit snapshot
- `references/HEYPROS-API-AUTHORITY.md` — HeyPros-specific reference notes
