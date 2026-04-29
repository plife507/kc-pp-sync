# scripts/

Small support scripts for active maintenance only.

## Active

- `gcloud-cleanup.sh` — dry-run-first cleanup for old Artifact Registry images and old Secret Manager versions.

## Removed

Deprecated one-time setup helpers were removed from this repo because they hardcoded old tab names, old Command-tab behavior, or old Cloud Function URLs. For month/tab creation and business-rule changes, update the source code and operator docs directly, then verify through the live sheet and Cloud Run logs.

For manual syncs, use the spreadsheet Apps Script menu in `apps-script/sync-button.gs` or call the Cloud Run HTTP endpoint directly. Do not use `gcloud run jobs execute` for this service.
