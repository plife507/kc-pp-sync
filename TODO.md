# TODO — kc-pp-sync

## Status
Stable in production. No active build sprint open.

Last reviewed: 2026-04-14

## Current priorities

### Verification / ops
- [ ] Confirm README, PROJECT-OVERVIEW, and deployed behavior stay aligned after future releases
- [ ] Keep GCloud revision/image cleanup light and periodic
- [ ] Re-check HeyPros/API assumptions before any logic change tied to archived/closed visibility

### Deferred until explicitly approved
- [ ] HeyPros write actions, including `jobLabelAttach` / `jobLabelDetach`

### Backlog / nice-to-have
- [ ] Consider a safe historical sync mode for 2+ months back if it becomes operationally necessary
- [ ] Decide whether hybrid jobs should ever get a real margin model once labor cost is available

## Recently completed
- [x] Payment dashboard live and auto-refreshing
- [x] Profitability dashboard live
- [x] Multi-invoice tracker shipped
- [x] Margin column shipped on one-off tabs
- [x] Recurring GTP merge bug fixed
- [x] Tests green, GitHub current

## Rule
Use this file only for live work. Move finished implementation detail into README or project history, not back into TODO sprawl.
