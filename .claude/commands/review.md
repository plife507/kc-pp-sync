---
name: review
description: "Review recent changes for bugs, type issues, and risks"
context: fork
agent: reviewer
---

Review the most recent changes in this project:

1. Run `git diff HEAD~1` (or `git diff --staged` if uncommitted)
2. Check each changed file for:
   - Logic bugs (round-robin, invoice filtering, month matching)
   - Type safety (no `any` escapes, proper null checks)
   - Manual column safety (never write B, F, S, U, V, W, X, Y)
   - API edge cases (cents→dollars, non-unique WO#, fuzzy search)
   - Test coverage for new logic
3. Report findings organized by severity (CRITICAL → LOW)
4. If no issues found, say so explicitly
