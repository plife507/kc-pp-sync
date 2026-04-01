---
name: test-and-fix
description: "Run tests, fix any failures, re-run until green"
allowed-tools: Bash, Read, Write, Edit
---

Run the test suite and fix any failures:

1. Run tests: `npm test`
2. If all pass → report summary and stop
3. If failures:
   a. Read the failing test to understand what's expected
   b. Read the source file being tested
   c. Fix the source (not the test) unless the test is clearly wrong
   d. Re-run tests
   e. Repeat up to 3 times
4. If still failing after 3 attempts → stop and report what's wrong

Do NOT change test expectations to make tests pass. Fix the implementation.

After fixing, rebuild: `npm run build` (dist/ must stay in sync).
