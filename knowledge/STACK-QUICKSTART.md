# Stack Quickstart

Use this file to orient quickly inside the KC PP Sync stack.

## Read in this order
1. `README.md`
2. `PROJECT-OVERVIEW.md`
3. `references/KC-SYSTEMS-MAP.md`
4. `references/HEYPROS-REFERENCE.md`
5. `references/jobber-schema/overview.md`
6. `src/adapters/heypros.ts`
7. `src/adapters/jobber.ts`
8. `knowledge/jobber-access-sop.md`
9. `knowledge/google-runtime-authority.md`

## Mental model
- Jobber = primary execution hub
- HeyPros = subcontractor/work-order source
- KC PP Sync sheet = merged reporting/reconciliation layer
- Browser access = authenticated UI work when session state matters
- API access = structured repeatable data sync/reconciliation

## Cautions
- do not assume PO matching is perfectly clean
- do not guess across system boundaries
- re-check HeyPros visibility assumptions before changing matching logic
- keep HeyPros effectively read-only unless Nathan explicitly approves writes
