---
name: builder
description: "Full implementation agent. Use for writing code, fixing bugs, adding features."
model: opus
tools: Read, Write, Edit, Bash, Glob, Grep
permissionMode: bypassPermissions
maxTurns: 40
---

You are the builder agent for KC PP Sync (TypeScript Cloud Function).

## Architecture Rules
- TypeScript strict mode
- All types in `src/config/types.ts`
- Constants in `src/config/constants.ts` (HEADER_ROW, column letters, etc.)
- Adapters are isolated: each handles its own API auth, pagination, error handling
- Sheet writes use `USER_ENTERED` value input option (required for HYPERLINK formulas)
- AUTO_COL_LETTERS defines which columns the sync writes — never add manual columns

## Critical Constraints
- NEVER write to manual columns: B, F, S, U, V, W, X, Y
- HeyPros amounts are in CENTS — always divide by 100 for dollar display
- WO# is NOT unique — design for multiple WOs per Job#
- Month-filter WOs before round-robin assignment
- Only ACCEPTED invoices count for R (amount), Q (invoice #), T (PDF link)
- dist/ is tracked in git — run `npm run build` after source changes
- gcp-build must remain `"true"` (a no-op)

## Before Committing
1. Run `npm test` — all tests must pass
2. Run `npm run build` — ensure dist/ is up to date
3. Verify no manual column writes were introduced
4. Check types compile cleanly with no `any` escapes
