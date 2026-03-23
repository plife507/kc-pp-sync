# Phase 0 — Contract and Scaffold

## Goal
Freeze build scope, constraints, and project structure for the read-only payment sync.

## Scope
In scope:
- project directory scaffold
- execution phases
- implementation contract for adapters, matcher, and sheet writer
- Claude Code build brief boundaries

Out of scope:
- real Jobber OAuth
- HeyPros write mutations
- Cloud Run deployment

## Status
complete

## Tasks
- [x] Create `projects/payment-sync/`
- [x] Create `TODO.md`
- [x] Create `phases/`
- [x] Define module boundaries and runtime contract
- [x] Prepare Claude Code implementation brief

## Gates
- [x] Project control surface exists
- [x] Scope and exclusions are explicit
- [x] Build brief constrains Claude Code to project directory and required features

## Pass Criteria
Phase passes when the project scaffold exists and the implementation contract is explicit enough for delegated coding without ambiguity.

## Evidence
- file: `projects/payment-sync/TODO.md`
- file: `projects/payment-sync/CLAUDE_TASK.md`
- file: `projects/payment-sync/phases/phase-0-contract-and-scaffold.md`
- note: branch `feat/payment-sync-test-mode` created

## Assumptions
### Proven
- Jobber credentials are not available on this container
- HeyPros is read-only for this phase
- `gog` CLI is installed and authenticated — used for Sheets write
- Google Sheets write works via `gog sheets create` + `gog sheets append`

### Assumed
- Existing repo can host a standalone TypeScript project under `projects/payment-sync/`

### Unknown
(none remaining)

## Blockers / Open Questions
(none)

## Next Phase Dependency
Unlocks Phase 1 implementation. Core coding should not start until module boundaries and build constraints are defined.
