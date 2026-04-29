# TODO — kc-pp-sync

## Status

Stable in production. Current prep is moving to a month-by-month tab rollover model before May tab/dashboard work.

Last reviewed: 2026-04-29

## Current Priorities

- [ ] Run targeted May one-off and recurring syncs once May work rows are ready.
- [ ] Refresh Dashboard/profitability after May syncs are structurally verified.
- [ ] Keep README, CLAUDE.md, and deployed behavior aligned after releases.
- [ ] Keep GCloud revision/image cleanup light and periodic.
- [ ] Re-check HeyPros/API assumptions before any logic change tied to archived/closed visibility.

## Deferred Until Explicitly Approved

- [ ] HeyPros write actions, including `jobLabelAttach` / `jobLabelDetach`.
- [ ] A real hybrid-job margin model once labor cost is available and approved.

## Recently Completed

- [x] Rebuilt live `May` from April layout and created `May - R` / `May - GTP $` through the service rollover path.
- [x] Removed stale hidden June-December prebuilt one-off and GTP tabs after confirming no live rows.
- [x] Added source-tab layout validation so mis-shaped future tabs fail before writes.
- [x] Confirmed live May prep state: hidden `May` missing margin C, hidden `May - GTP $` existed, `May - R` missing.
- [x] Decided to stop prebuilding the rest of the year; create month tabs only during rollover.
- [x] Removed deprecated one-time setup helpers from `scripts/`.
- [x] Updated docs to avoid stale Cloud Run revision claims.
- [x] Payment dashboard live and auto-refreshing.
- [x] Profitability dashboard live.
- [x] Multi-invoice tracker shipped.
- [x] Margin column shipped on one-off tabs.
- [x] Recurring GTP merge bug fixed.

## Rule

Use this file only for live work. Move finished implementation detail into README, project overview, or historical notes instead of adding TODO sprawl.
