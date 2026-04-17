# HeyPros API Authority — Reference Map

This document is the local navigation index for the HeyPros knowledge that `kc-pp-sync` depends on.

The old external canonical path is no longer present in this workspace, so this repo now needs to carry the project-safe reference layer directly.

---

## Start here

| What | Location |
|---|---|
| KC systems overview | `references/KC-SYSTEMS-MAP.md` |
| Project-safe HeyPros reference | `references/HEYPROS-REFERENCE.md` |
| Jobber schema reference set | `references/jobber-schema/` |

---

## Live code authority

For actual runtime behavior, use these as source-of-truth:

| What | Location |
|---|---|
| HeyPros adapter | `src/adapters/heypros.ts` |
| Jobber adapter | `src/adapters/jobber.ts` |

These files define the live auth, pacing, matching, and API behavior used by production.

---

## Key proven mappings

```
job.hashid            = work-order page key
job.purchaseOrder     = WO# field used to match back to Jobber job number
job.hashidNumeric     = website-visible numeric ID
job.jobLabelInstances = label instances
job.jobInvoices[]     = invoice list (amounts in cents — divide by 100)
invoice.file.fileName = PDF file name → URL: https://hey-pros-api.birdsdontexist.com/files/{fileName}
```

---

## Important current assumptions to re-check before logic changes

- Archived HeyPros jobs were not returned by the `jobsDashboard` behavior tested on 2026-04-14.
- Completed/closed jobs are returned as `Done`.
- Duplicate PO/job-number patterns exist and are not automatically bugs.
- Contractor attribution can require `ostensibleWinner.user`, not just `attachedContractors[0]`.

---

## Guardrails

The hard runtime guardrails are implemented in `src/adapters/heypros.ts`:
- token caching first
- max 1 sign-in per 15 minutes
- 250ms paced pagination
- no auth retry loops
- hard stop on 403/429/"too many" blocking behavior

Do not soften these without explicit review.

---

## Write policy

HeyPros writes remain deferred.
Nathan must explicitly approve any mutation/write work before it is added to this project.
