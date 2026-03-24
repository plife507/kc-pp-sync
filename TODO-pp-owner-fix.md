# TODO: PP Owner Selection — ostensibleWinner Priority Fix

## Summary
Flip PP owner selection to prefer `ostensibleWinner` over `attachedContractors[0]`.

## Phase 1: Code Change
- [ ] Change line 185 in `src/function.ts`:
  - FROM: `const contractor = heyPros?.attachedContractors?.[0] ?? heyPros?.ostensibleWinnerUser ?? null;`
  - TO: `const contractor = heyPros?.ostensibleWinnerUser ?? heyPros?.attachedContractors?.[0] ?? null;`
- [ ] Build: `npm run build`
- [ ] Tests pass: `npm test`

### Gate 1: Code compiles and tests pass

## Phase 2: Deploy + Verify
- [ ] Deploy to GCloud
- [ ] Run March sync
- [ ] Verify job 19646 shows correct PP owner (Edgar Becerra, not Davon Carr)

### Gate 2: Sync completes successfully + 19646 correct

## Done Criteria
- ostensibleWinner is preferred over attachedContractors[0]
- All existing tests pass
- March sync runs clean
- Job 19646 shows correct contractor

## Abort If
- Any test fails after the change
- Sync produces unexpected column changes beyond C/D
