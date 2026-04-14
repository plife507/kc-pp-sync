# scripts/

Small support scripts for setup or maintenance.

| Script | Purpose | Status |
|---|---|---|
| `setup-month-tabs.py` | One-time spreadsheet tab setup | Historical |
| `setup-command-tab.py` | One-time Command tab setup | Historical |
| `command-tab-appscript.gs` | Legacy Command-tab helper | Deprecated |
| `gcloud-cleanup.sh` | Artifact Registry cleanup after deploys | Active |

For manual syncs, use the spreadsheet sidebar or call the Cloud Run HTTP endpoint directly. Do not use `gcloud run jobs execute` for this service.
