# TODO — kc-pp-sync

## Status

Stable in production. Repo cleanup is the current prep step before May tab/dashboard work.

Last reviewed: 2026-04-29

## Current Priorities

- [ ] Repair live hidden `May` tab to March/April 40-column visible layout with margin column C.
- [ ] Create live `May - R` recurring tab from the 26-column recurring layout.
- [ ] Unhide/verify `May`, `May - R`, and `May - GTP $`, then run targeted May syncs.
- [ ] Refresh Dashboard/profitability after May tabs are structurally verified.
- [ ] Keep README, CLAUDE.md, and deployed behavior aligned after releases.
- [ ] Keep GCloud revision/image cleanup light and periodic.
- [ ] Re-check HeyPros/API assumptions before any logic change tied to archived/closed visibility.

## Deferred Until Explicitly Approved

- [ ] HeyPros write actions, including `jobLabelAttach` / `jobLabelDetach`.
- [ ] A real hybrid-job margin model once labor cost is available and approved.

## Recently Completed

- [x] Added source-tab layout validation so mis-shaped future tabs fail before writes.
- [x] Confirmed live May prep state: hidden `May` missing margin C, hidden `May - GTP $` exists, `May - R` missing.
- [x] Removed deprecated one-time setup helpers from `scripts/`.
- [x] Updated docs to avoid stale Cloud Run revision claims.
- [x] Payment dashboard live and auto-refreshing.
- [x] Profitability dashboard live.
- [x] Multi-invoice tracker shipped.
- [x] Margin column shipped on one-off tabs.
- [x] Recurring GTP merge bug fixed.

## Rule

Use this file only for live work. Move finished implementation detail into README, project overview, or historical notes instead of adding TODO sprawl.
