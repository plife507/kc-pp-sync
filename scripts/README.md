# scripts/

Utility scripts for KC PP Sync setup and maintenance.

| Script | Purpose | Status |
|---|---|---|
| `setup-month-tabs.py` | One-time: create monthly tab structure in spreadsheet | ✅ Done |
| `setup-command-tab.py` | One-time: create Command (sync log) tab | ✅ Done |
| `command-tab-appscript.gs` | Legacy Apps Script for Command tab (replaced by Cloud Run logging) | Deprecated |
| `gcloud-cleanup.sh` | Clean up old Artifact Registry images after deploys | Active |

For manual syncs, use the **KC Sync** sidebar menu in the spreadsheet (Apps Script) or trigger via `gcloud run jobs execute`.
