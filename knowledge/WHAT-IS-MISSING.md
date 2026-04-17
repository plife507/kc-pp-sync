# What Is Still Missing

This file tracks knowledge that may still matter to `kc-pp-sync` but is not yet fully preserved inside this repo.

## Missing or partial items

### 1. Full HeyPros schema archive
Status: missing from current workspace path used by earlier docs

What would help:
- full schema JSON
- schema map / readable type index
- any verified query library that previously lived outside this repo

Why it matters:
- safer future field verification
- easier recovery if live probing is needed again
- reduces dependence on memory/chat summaries

### 2. Historical HeyPros investigation artifacts
Status: partial only

Currently available here:
- repo-local reference docs
- live adapter truth in `src/adapters/heypros.ts`
- some temporary probe scripts outside the repo existed in workspace `tmp/`

Still useful if recovered cleanly:
- archived/closed visibility test notes
- duplicate WO analysis notes
- contractor review schema findings
- any normalized field-contract docs

### 3. Sheets-specific authority docs
Status: partially outside repo

Useful candidates if later needed:
- `docs/gsheets-expert-playbook.md`
- `docs/sheets-use-best-practices.md`

Why they were not copied yet:
- current repo already has enough to operate
- wanted to avoid dumping extra noise until it proves useful

### 4. Live deployment evidence snapshots
Status: not preserved as structured evidence inside repo

Examples that could help later:
- current Cloud Run revision/service settings
- scheduler inventory snapshot
- example successful sync payload/response
- current sheet tab inventory/layout snapshot

Why it matters:
- easier future audits
- clearer rollback/debug context

## Rule for future additions
Only import missing material if it is:
- project-relevant
- durable
- safe to store in git
- cleaner than leaving it trapped in chat or memory
