# TODO — kc-pp-sync

## Status

Stable in production. Repo cleanup is the current prep step before May tab/dashboard work.

Last reviewed: 2026-04-29

## Current Priorities

- [ ] Plan and implement May one-off/recurring/GTP tab support.
- [ ] Update Dashboard/profitability logic for May once tab shape is confirmed.
- [ ] Keep README, CLAUDE.md, and deployed behavior aligned after releases.
- [ ] Keep GCloud revision/image cleanup light and periodic.
- [ ] Re-check HeyPros/API assumptions before any logic change tied to archived/closed visibility.

## Deferred Until Explicitly Approved

- [ ] HeyPros write actions, including `jobLabelAttach` / `jobLabelDetach`.
- [ ] A real hybrid-job margin model once labor cost is available and approved.

## Recently Completed

- [x] Removed deprecated one-time setup helpers from `scripts/`.
- [x] Updated docs to avoid stale Cloud Run revision claims.
- [x] Payment dashboard live and auto-refreshing.
- [x] Profitability dashboard live.
- [x] Multi-invoice tracker shipped.
- [x] Margin column shipped on one-off tabs.
- [x] Recurring GTP merge bug fixed.

## Rule

Use this file only for live work. Move finished implementation detail into README, project overview, or historical notes instead of adding TODO sprawl.
