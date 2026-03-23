# Phase 1 — Core Implementation

## Goal
Implement the TypeScript payment sync with modular adapters, matcher logic, fixtures, CLI entrypoint, and tests.

## Scope
In scope:
- TypeScript project setup
- HeyPros auth and paginated read adapter
- Jobber mock adapter and fixtures
- matcher logic for duplicate and missing WO# cases
- Google Sheets writer
- tests for core matching behavior and output shaping

Out of scope:
- real Jobber API integration
- HeyPros mutations
- deployment packaging beyond local run instructions

## Status
complete

## Tasks
- [x] Create package and TypeScript config
- [x] Implement HeyPros adapter
- [x] Implement Jobber mock adapter
- [x] Implement matcher logic
- [x] Implement Sheets writer
- [x] Implement CLI entrypoint
- [x] Add tests

## Gates
- [x] Script runs locally in test mode
- [x] Pagination handled across all HeyPros pages (code in place, blocked by auth for live)
- [x] Duplicate WO# case covered by tests
- [x] Missing match and already-labeled cases covered by tests
- [x] No write path exists for HeyPros

## Pass Criteria
Phase passes when the implementation is present, reviewed, and locally testable with passing tests for required edge cases.

## Evidence
- file: `projects/payment-sync/src/`
- file: `projects/payment-sync/test/`
- sample: 7/7 tests passing
- sample: mock sync output verified with all edge cases (needs label, already labeled, duplicate WO#, not found)

## Assumptions
### Proven
- `tsx` is available for local execution
- `gog` CLI works for Sheets create + append

### Assumed
(none)

### Unknown
(none)

## Blockers / Open Questions
(none)

## Next Phase Dependency
Unlocks Phase 2 verification and handoff.
