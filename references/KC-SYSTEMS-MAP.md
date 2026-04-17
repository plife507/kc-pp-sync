# KC Systems Map

This repo exists to sync and reconcile data across the KC Power Clean operations stack.

## Overall flow

- **Jobber** is the primary execution hub for job records, invoice records, client-facing payment state, and operational job context.
- **HeyPros** is the subcontractor/work-order system for dispatched work, attached contractors, ostensible winner, labels, and subcontractor invoice records.
- **KC PP Sync sheet** is the reporting and reconciliation layer that merges the two systems into operator-friendly monthly tabs, GTP views, dashboard summaries, and audit notes.
- **Browser access** matters when authenticated UI context is needed, especially for Jobber operational work outside this sync service.
- **API access** matters for repeatable sync/reconciliation logic, where the service reads structured data from Jobber GraphQL and HeyPros GraphQL.

## What truth lives where

### Jobber
Primary truth for:
- job records and job numbers
- client names
- invoice records and client payment state
- job type / job status
- Jobber web links for operational follow-up

Jobber is the primary execution hub. If the question is about the KC-side customer/job/invoice lifecycle, Jobber is usually the first source to verify.

### HeyPros
Primary truth for:
- work orders returned by `jobsDashboard`
- purchase-order field used to match back to Jobber job numbers
- attached contractors
- ostensible winner
- HeyPros invoice records and PDF file links
- job labels and subcontractor-side workflow metadata

HeyPros is the subcontractor/work-order source, not the primary customer execution system.

### KC PP Sync sheet
Primary truth for:
- merged reporting state used by operators
- monthly one-off and recurring payment views
- Good To Pay outputs
- dashboard aggregates
- auto notes that flag reconciliation issues or ambiguity

The sheet is an operational reporting layer, not the authoritative source for raw Jobber or raw HeyPros truth.

## How the systems connect

### Core join key
The main cross-system join is:
- **Jobber job number** ↔ **HeyPros `purchaseOrder`**

That join is useful but not perfectly clean.

### Important matching realities
- HeyPros `purchaseOrder` is not guaranteed to be a single clean value.
- Multi-value and shorthand formats exist and must be parsed.
- Duplicate WO/job-number patterns exist in HeyPros and are not automatically bugs.
- Completed/closed HeyPros jobs can still be visible as `Done`.
- Archived HeyPros jobs were not returned in the live `jobsDashboard` behavior tested on 2026-04-14.

Because of this, matching must be treated as disciplined reconciliation, not assumed one-to-one truth.

## Where browser access matters

Use authenticated browser access when:
- UI/session state matters
- Jobber work requires the live web app
- an operator needs to inspect or act on a specific authenticated record/page
- the task is operational browsing, not bulk structured sync

For Jobber, the established default access path is authenticated OpenClaw browser use against the host browser/profile, not public-site fetches.

## Where API access matters

Use API access when:
- the task is repeatable, structured, and data-oriented
- many jobs/work orders must be compared or merged
- the sync service needs deterministic fields
- you need logs/tests/code-level verification

This repo uses:
- **Jobber GraphQL** for job and invoice data
- **HeyPros GraphQL** for work-order, contractor, label, and invoice-side data

## Where the sheet fits

The sheet is where merged business logic becomes usable output.

Key roles:
- monthly sync tabs
- recurring vs one-off separation
- GTP outputs
- dashboard summaries
- auto notes for edge cases
- command-log visibility for sync runs

The sheet is where ambiguity is surfaced for humans instead of silently guessed away.

## Major risks and failure modes

### Matching risk
- assuming PO values are unique and clean
- treating duplicate WO/job-number patterns as bugs without review
- failing to re-check HeyPros visibility assumptions before logic changes

### Authority confusion
- using the sheet as if it were raw source truth
- using browser impressions as if they were API contracts
- assuming Jobber and HeyPros describe the same thing at the same granularity

### Automation risk
- relaxing HeyPros auth/rate-limit guardrails
- making HeyPros writes without explicit approval
- silently changing access mode when browser/API/auth paths fail

## Operator rules

- Verify which system holds the truth before acting.
- Treat Jobber as the primary execution hub.
- Treat HeyPros as the subcontractor/work-order system.
- Treat the sheet as merged reporting, not source truth.
- Re-verify assumptions before changing matching logic.
- Surface ambiguity in notes/output instead of guessing.
