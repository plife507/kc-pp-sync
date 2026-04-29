# kc-pp-sync

KC Power Clean's PP sheet sync service. It pulls Jobber client-payment data and HeyPros subcontractor data, writes the KC PP Sync spreadsheet, and refreshes Dashboard/GTP/profitability views.

## Production

- Runtime: Cloud Run service `kc-pp-sync`
- Project/region: `aya-gservicies` / `us-central1`
- Sheet: `KC PP Sync` (`1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`)
- Sources: Jobber GraphQL, HeyPros GraphQL
- Auth: Cloud Run requires an identity token
- Deploy path: `gcloud run deploy kc-pp-sync --source .`

Check live state instead of trusting stale revision notes:

```bash
gcloud run services describe kc-pp-sync --region us-central1 --project aya-gservicies

gcloud run revisions list --service kc-pp-sync --region us-central1 --project aya-gservicies --limit=8

gcloud scheduler jobs list --location us-central1 --project aya-gservicies
```

## What It Does

- Syncs current, previous, and older month one-off tabs.
- Syncs current and previous recurring tabs.
- Matches HeyPros WOs to Jobber jobs through `purchaseOrder`, including multi-value PO fields.
- Writes one row per matched HeyPros WO.
- Preserves manual payment columns while refreshing generated columns.
- Refreshes monthly `GTP $` tabs, `Dashboard`, and profitability sections.
- Logs sync runs to the `Log` tab.
- Refreshes Jobber OAuth tokens through Secret Manager.

## Sheet Layouts

| Tab family | Examples | Columns | Key rule |
|---|---|---:|---|
| New one-off | `March`, `April`, `May` | 40, A-AN | Has margin col C and 5-slot invoice tracker Z-AN |
| Legacy one-off | `February` | 27, A-AA | Has margin col C but single-invoice layout |
| Recurring | `March - R`, `April - R` | 26, A-Z | No margin col C; indices are shifted from one-off tabs |
| GTP output | `April - GTP $` | 9 | Generated from one-off + recurring source tabs |
| Dashboard | `Dashboard` | varies | Generated summary/profitability output |
| Sync log | `Log` | 8 | Appended after each sync |
| Command UI | `⚡ Command` | varies | In-sheet command center, not the sync log |

The recurring/no-margin difference is the main footgun. Any read/write logic that touches columns must branch across new one-off, legacy one-off, and recurring layouts.

Before syncing, source tabs are validated against the expected header positions. This prevents hidden/future month templates from silently syncing one column off.

Do not prebuild the rest of the year. Keep historical/current month tabs only, then create the next month when rollover is actually needed. This keeps stale hidden templates from drifting behind the active layout.

Monthly rollover checklist:

1. Confirm the new month does not already contain live rows.
2. Create the one-off tab from the latest known-good 40-column month layout.
3. Create the recurring tab from the latest known-good 26-column recurring layout.
4. Create or verify the `{Month} - GTP $` output tab.
5. Validate headers, run targeted one-off and recurring syncs, then refresh Dashboard/profitability.

## Sync API

Manual syncs use authenticated POSTs to Cloud Run.

```bash
TOKEN=$(gcloud auth print-identity-token)
curl -X POST https://kc-pp-sync-823212137840.us-central1.run.app \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"mode":"current"}'
```

Supported modes:

- `current` — current month one-off tab
- `current-r` — current month recurring tab
- `prev` — previous month one-off tab
- `prev-r` — previous month recurring tab
- `dashboard` — dashboard/profitability refresh only
- `all-prev` — older one-off tabs before previous month

Exact tab targeting is also supported:

```bash
-d '{"tab":"April"}'
-d '{"tab":"April - R"}'
```

## Scheduler

| Job | Schedule | Mode |
|---|---|---|
| `kc-pp-sync-hourly` | `*/20 * * * *` | `current` |
| `kc-pp-sync-recurring` | `5,25,45 * * * *` | `current-r` |
| `kc-pp-sync-prev-month` | `10,30,50 * * * *` | `prev` |
| `kc-pp-sync-prev-recurring` | `15,35,55 * * * *` | `prev-r` |
| `kc-pp-sync-dashboard` | `18,38,58 * * * *` | `dashboard` |
| `kc-pp-sync-older` | `0 */4 * * *` | `all-prev` |

GTP tabs and Dashboard refresh also run after normal tab syncs. The dashboard job is a lightweight refresh lane.

## Development

```bash
npm install
npm run build
npm test
```

Current test shape: `test/output-sheet.test.ts` covers layout columns, manual-column protection, multi-invoice behavior, auto-notes, round-robin WO matching, PO parsing, margin calculations, and conditional-format formula generation.

`dist/` is tracked because deploy uses a no-op `gcp-build` script. Build before committing source changes.

## Deploy

```bash
npm run build
npm test

gcloud run deploy kc-pp-sync \
  --source . \
  --region us-central1 \
  --project aya-gservicies \
  --no-allow-unauthenticated
```

After deploy, verify the latest ready revision, traffic, a safe endpoint call, and recent Cloud Run logs.

## Active Support Files

- `src/function.ts` — HTTP handler, mode routing, orchestration, margin computation.
- `src/adapters/sheets.ts` — sheet reads/writes, GTP, Dashboard, profitability, CF, sync logging.
- `src/adapters/jobber.ts` — Jobber GraphQL + OAuth token refresh.
- `src/adapters/heypros.ts` — HeyPros auth, token cache, paginated job fetch.
- `src/config/constants.ts` — headers and layout maps.
- `apps-script/sync-button.gs` — active in-sheet Apps Script menu.
- `scripts/gcloud-cleanup.sh` — dry-run-first Artifact Registry and Secret Manager cleanup.
- `TODO.md` — active/deferred work only.

## Boundaries

- Do not auto-write manual columns.
- Do not add margin column C to recurring tabs.
- Do not pre-create future month tabs beyond the active rollover month.
- Do not change `gcp-build` away from `true` unless the deploy model changes.
- Do not make HeyPros writes unless Nathan explicitly approves them.
- Do not commit local secrets or private notes.
