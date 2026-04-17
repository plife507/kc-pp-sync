# HeyPros Reference for kc-pp-sync

This file captures the project-safe HeyPros knowledge that `kc-pp-sync` depends on.

## Role in this project

HeyPros is the subcontractor/work-order source used to enrich Jobber payment data.

This project uses HeyPros to read:
- work orders from `jobsDashboard`
- purchase-order values for Jobber matching
- attached contractors
- ostensible winner
- job labels
- subcontractor invoice records and PDF file names

## Endpoint and auth

- GraphQL endpoint: `https://hey-pros-api.birdsdontexist.com/graphql`
- Required tenant header: `kc-power-clean.heypros.com`
- Auth flow: `signIn` mutation returning `accessToken`

## Hard guardrails

These rules are implemented in `src/adapters/heypros.ts` and are not optional:

1. **Token caching first**
   - Reuse cached token until it has less than 5 minutes remaining.

2. **Sign-in rate limit**
   - Maximum 1 sign-in attempt per 15 minutes.
   - Do not rapid-retry auth.

3. **Paced pagination**
   - Minimum 250ms delay between paginated requests.

4. **No auth retry loops**
   - If sign-in fails, stop.

5. **Stop on blocking/throttle behavior**
   - If 403, 429, or "too many" style blocking appears, stop immediately.

## Current query shape used by this repo

The sync service uses `jobsDashboard(page, perPage)` and reads:
- `hashid`
- `hashidNumeric`
- `purchaseOrder`
- `statusV2 { label }`
- `jobLabelInstances { label { hashid name } }`
- `installationStarts`
- `attachedContractors { hashid firstName lastName companyName }`
- `ostensibleWinner { user { hashid firstName lastName companyName } }`
- `jobInvoices { hashidNumeric amount status { label } file { fileName } }`

## Matching contract used here

Main join:
- HeyPros `purchaseOrder` ↔ Jobber job number

Important realities:
- `purchaseOrder` can be a single value, multi-value string, or shorthand pattern.
- Parsing is required, not optional.
- Example handled patterns include:
  - `19616 19659`
  - `19353 / 54`
  - `Job #19553`

The adapter handles this with `parsePurchaseOrder()`.

## Important live behavior currently assumed

- Archived HeyPros jobs were **not returned** by the `jobsDashboard` API behavior tested on 2026-04-14.
- Completed/closed jobs **are returned** as `Done`.
- Duplicate PO/job-number patterns exist and are often legitimate recurring or multi-work-order business patterns.
- Matching logic must treat duplicate patterns as a review concern, not automatic evidence of a bug.

## Important known edge case

A known contractor-owner edge case was previously identified:
- some jobs can have multiple attached contractors
- the actual owner/payee may be `ostensibleWinner.user`, not `attachedContractors[0]`

For contractor attribution logic, prefer explicit owner logic over naive first-contractor assumptions.

## Invoice / file mapping quick reference

- `jobInvoices[].amount` is in cents, divide by 100 for currency use
- invoice PDF URL shape:
  - `https://hey-pros-api.birdsdontexist.com/files/{fileName}`

## Write policy

This project should be treated as effectively read-only against HeyPros unless Nathan explicitly approves writes.

HeyPros writes, including label mutations, are deferred and should not be added casually.
