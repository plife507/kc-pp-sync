# KC PP Sync — v1.1 Cleanup

## Status: READY

## Workspace
- Code: /data/.openclaw/workspace/projects/kc-pp-sync
- Branch: feat/v1.1
- CLAUDE.md: /data/.openclaw/workspace/projects/kc-pp-sync/CLAUDE.md

---

## Phase 1: Dead Code Removal

### Task
Remove legacy code that no longer serves any purpose.

### Changes
1. **Delete `test/matcher.test.ts`** — 156 lines testing deleted `matcher.ts`. Tests pass because they're self-contained but test nothing real.
2. **Delete `fetchJobberInvoices` function + `buildInvoicesQuery`** in `src/adapters/jobber.ts` — old "fetch all invoices" flow, replaced by `fetchJobberJobsByNumbers`. ~90 lines at bottom of file.
3. **Remove `JobberInvoicesResponse` import** from `jobber.ts` if only used by deleted function.

### Gate 1
- [ ] `matcher.test.ts` deleted
- [ ] `fetchJobberInvoices` + `buildInvoicesQuery` removed from jobber.ts
- [ ] No remaining imports reference deleted code
- [ ] `npm test` passes (should drop from 54 to ~47 tests)
- [ ] `npm run build` succeeds

---

## Phase 2: Fix Deploy Safety

### Task
Ensure the project can be deployed from a fresh clone without pre-built `dist/`.

### Changes
1. **Remove `dist/` from `.gitignore`** — track compiled output so fresh clones can deploy
2. **Run `npm run build`** to ensure dist/ is current
3. **Add dist/ files to git**

### Gate 2
- [ ] `dist/` is NOT in `.gitignore`
- [ ] `dist/` is tracked in git with current compiled output
- [ ] `gcp-build` remains `"true"` (no-op) — GCloud uses pre-built dist
- [ ] `npm run build` matches what's in dist/ (no diff after rebuild)

---

## Phase 3: Range + Version + Path Fixes

### Task
Fix hardcoded limits and stale references.

### Changes
1. **Expand `F2:F200` → `F2:F500`** in `src/function.ts` line ~89 — matches formatting range, prevents future row limit
2. **Bump version `0.1.0` → `1.0.0`** in `package.json`
3. **Update stale path** in `src/adapters/jobber.ts` error message (~line 459): change `/data/.openclaw/workspace-aya-dev/kc/.env` to generic message (Cloud Functions don't have that path anyway)

### Gate 3
- [ ] `F2:F500` in function.ts (grep confirms no remaining `F2:F200`)
- [ ] `package.json` version is `1.0.0`
- [ ] No references to `workspace-aya-dev` in src/ files
- [ ] `npm test` passes
- [ ] `npm run build` succeeds

---

## Phase 4: Deploy + Verify

### Task
Build, deploy, trigger sync, confirm clean execution.

### Changes
1. `npm run build` — rebuild dist with all changes
2. `git add -A && git commit` — single clean commit
3. `git push origin feat/v1.1`
4. `gcloud functions deploy kc-pp-sync ...` — full deploy
5. Trigger manual sync via curl
6. Verify response: status ok, row count matches

### Gate 4
- [ ] Build succeeds with no warnings
- [ ] Deploy creates new revision (check revision name)
- [ ] Manual sync returns `{ status: "ok" }` with expected row count (~154)
- [ ] No errors in Cloud Run logs
- [ ] Git pushed to origin

---

## Phase 5: Update CLAUDE.md

### Task
Update CLAUDE.md to reflect all changes from this cleanup.

### Changes
1. Remove `matcher.test.ts` from file list
2. Remove `fetchJobberInvoices` mention
3. Update range to F2:F500
4. Note version is 1.0.0
5. Update any other stale references

### Gate 5
- [ ] CLAUDE.md file list matches actual `find src/ test/ -name "*.ts"`
- [ ] No references to deleted files or functions
- [ ] Version noted as 1.0.0

---

## Constraints
- All changes on `feat/v1.1` branch
- Do not touch manual columns (B, F, S, U, V, W, X, Y)
- Do not modify auto-column logic or sheet formatting
- Tests must pass after every phase
- Single commit for phases 1-3, deploy in phase 4

## Done Criteria
- Zero dead code (no matcher.test.ts, no fetchJobberInvoices)
- Deploy-safe from fresh clone (dist tracked in git)
- F2:F500 range (matches formatting)
- Version 1.0.0 in package.json
- No stale path references
- CLAUDE.md current
- All deployed and verified live
