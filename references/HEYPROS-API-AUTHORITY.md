# HeyPros API Authority — Reference Map

This document is the navigation index for HeyPros API technical knowledge.
All canonical contracts live in `projects/heypros-api/`.
kc-pp-sync consumes them; do not duplicate them here.

---

## Schema

| What | Location |
|---|---|
| Full schema (JSON) | `projects/heypros-api/schema/schema.json` |
| Schema map (readable) | `projects/heypros-api/schema/schema-map.md` |
| Schema archive (historical) | `projects/heypros-api/schema/archive/` |

---

## Field Contracts

| What | Location |
|---|---|
| Job core fields | `projects/heypros-api/references/field-contract-job-core.md` |
| Invoice core fields | `projects/heypros-api/references/field-contract-invoice-core.md` |
| Label fields | `projects/heypros-api/references/field-contract-labels.md` |
| Contractor core fields | `projects/heypros-api/references/field-contract-contractor-core.md` |
| WO lookup contract | `projects/heypros-api/references/field-contract-wo-lookup.md` |
| Full JobDto card schema | `projects/heypros-api/references/heypros-job-card-schema.md` |

---

## Verified Query Library

Location: `projects/heypros-api/queries/`

| Query | File |
|---|---|
| WO by hashid | `queries/wo-by-hashid.graphql` |
| WO by purchase order | `queries/wo-by-purchase-order.graphql` |
| WO invoices | `queries/wo-invoices.graphql` |
| WO labels | `queries/wo-labels.graphql` |
| WO sheet row (full) | `queries/wo-sheet-row.graphql` |
| Invoice PDF | `queries/invoice-pdf.graphql` |
| Fragments | `queries/fragments/` |

---

## Edge Cases and Behavior

| What | Location |
|---|---|
| Edge case detection rules | `projects/heypros-api/references/edge-case-detection.md` |
| Full edge case sweep (2026-03-20) | `projects/heypros-api/references/edge-case-full-sweep-2026-03-20.md` |
| Duplicate WO# case study (WO#19699) | `projects/heypros-api/references/case-study-wo-19699-duplicate-exact-match.md` |
| Contractor cardinality case study | `projects/heypros-api/references/case-study-contractor-cardinality.md` |
| API exploration notes (2026-03-20) | `projects/heypros-api/references/api-exploration-2026-03-20.md` |
| Live API validation (2026-03-19) | `projects/heypros-api/references/live-api-validation-2026-03-19.md` |

---

## Auth and Rate-Limit Rules

| What | Location |
|---|---|
| Runtime guardrails (read-only) | `projects/heypros-api/references/runtime-guardrails-readonly.md` |
| Rate limit and backoff notes | `projects/heypros-api/references/rate-limit-and-backoff-notes.md` |
| Read-only SOP | `projects/heypros-api/references/read-only-sop.md` |

These rules are hardwired into `src/adapters/heypros.ts`. Do not soften them.

---

## Write / Mutation Docs (Future)

| What | Location |
|---|---|
| Label mutations investigation | `projects/heypros-api/references/label-mutations-investigation-2026-03-20.md` |

HeyPros writes are deferred. Nathan must approve before any mutation code is added.

---

## Key Proven Mappings (Quick Reference)

```
job.hashid           = work-order page key
job.purchaseOrder    = WO# (matches Jobber Job Number)
job.hashidNumeric    = website-visible numeric ID (displayed as dashed: 9-331-562)
job.jobLabelInstances[].label = labels
job.jobInvoices[]    = invoice list (amounts in cents — divide by 100)
invoice.hashidNumeric = invoice display ID (dashed format)
invoice.file.fileName = PDF file name → URL: https://hey-pros-api.birdsdontexist.com/files/{fileName}
```

**PAID BY CLIENT label hashid:** `7XzO5G`
**HeyPros GraphQL endpoint:** `https://hey-pros-api.birdsdontexist.com/graphql`
**Tenant header:** `kc-power-clean.heypros.com`
**Auth:** signIn mutation, max 1 attempt per 15 min, no retry loops
