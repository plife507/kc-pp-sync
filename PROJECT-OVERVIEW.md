# KC PP Sync — Project Overview

## Goal

Keep the KC PP Sync spreadsheet current with Jobber client-payment data and HeyPros subcontractor data, while preserving manual finance workflow columns.

## Production Shape

- Runtime: Cloud Run service `kc-pp-sync`
- Triggers: Cloud Scheduler
- Output: Google Sheets workbook `KC PP Sync`
- Sources: Jobber GraphQL + HeyPros GraphQL

## Current Behavior

- Syncs current, previous, and older month one-off tabs.
- Syncs current and previous recurring tabs.
- Matches HeyPros work orders to Jobber jobs through `purchaseOrder`.
- Handles multi-value PO fields and multi-invoice cases.
- Writes one row per matched HeyPros WO.
- Refreshes Dashboard and GTP outputs.
- Logs sync runs to `Log`.

## Canonical docs
- `README.md` — main system/operator reference
- `TODO.md` — only active or deferred work
- `AUDIT-2026-04-09.md` — historical audit snapshot
- `references/KC-SYSTEMS-MAP.md` — how Jobber, HeyPros, browser access, APIs, and the sheet connect
- `references/HEYPROS-REFERENCE.md` — project-safe HeyPros operational reference
- `references/HEYPROS-API-AUTHORITY.md` — local HeyPros reference index
- `references/jobber-schema/` — Jobber schema reference set used by this project
- `knowledge/README.md` — imported supporting SOPs and authority docs
- `knowledge/STACK-QUICKSTART.md` — fast orientation path for new Aya / coding workers

## Operating Posture

- Production is live and stable for normal use.
- README is the main operator doc.
- CLAUDE.md is the short coding-agent guide.
- TODO.md is only for active/deferred work.
- Historical phase docs are retained for audit context, not current runbooks.

## Active Cautions

- Duplicate WO/PO patterns should be treated as business-shape data first, not assumed bugs.
- Jobber and HeyPros assumptions should be re-verified before matching logic changes.
- Do not make HeyPros writes unless Nathan explicitly approves them.
- Do not rely on stale hardcoded revision numbers; inspect live Cloud Run state.

## Next Planned Work

- Add/verify May tabs and GTP output shape.
- Update business logic needed for May operations.
- Update Dashboard/profitability behavior for May once tab shape is confirmed.
