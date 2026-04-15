# KC PP Sync + Aya Local OpenClaw Setup Handoff

**Created:** 2026-04-14
**Purpose:** Full local setup guide for a fresh OpenClaw install on Nathan's computer, including current accounts, services, env vars, secret values, repo setup, and validation steps.

## 1. Goal

Stand up a fresh **local OpenClaw** environment that can operate Aya and support the `kc-pp-sync` repo without depending on the problematic cloud IP path.

This handoff covers:
- OpenClaw local setup
- Google / GCP auth
- Google Sheets access
- Jobber auth + OAuth values
- HeyPros auth
- repo environment requirements
- service account notes
- current known issues
- validation steps after install

---

## 2. Core Accounts

### Primary Google / GCP / Workspace account
- **Email:** `aya@kcpowerclean.com`
- **Current known password:** `Zeus!2345`

Use this account for:
- Google Workspace
- Google Sheets
- GCP project access
- Cloud Run
- Cloud Scheduler
- Secret Manager
- IAM / service accounts
- Apps Script (if needed)

### GCP Project
- **Project ID:** `aya-gservicies`
- **Region:** `us-central1`

### Main spreadsheet
- **KC PP Sync Sheet ID:** `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`

---

## 3. Repo

### Repo name
- `kc-pp-sync`

### Workspace path in current OpenClaw environment
- `/data/.openclaw/workspace/projects/kc-pp-sync`

Clone this repo locally to your preferred projects folder and use that as the working directory for local OpenClaw / Claude / terminal workflows.

---

## 4. OpenClaw local setup

## Install / bootstrap
1. Install OpenClaw locally on your computer.
2. Start with a **clean local config** rather than copying the noisy cloud instance wholesale.
3. Reconnect only the integrations you actually need first.
4. Keep secrets in a local env/secrets file, not in git.

## Recommended local priority order
1. local OpenClaw install
2. Telegram/chat surface if desired
3. Google auth (`aya@kcpowerclean.com`)
4. gcloud auth for project `aya-gservicies`
5. `kc-pp-sync` repo clone
6. repo env/secrets
7. test Google Sheets access
8. test Cloud Run invoke
9. test Jobber refresh
10. test HeyPros access
11. only then reconnect ACP / Claude Code

---

## 5. Google / GCP setup

## Required logins
Login with:
- `aya@kcpowerclean.com`
- password: `Zeus!2345`

## gcloud
After installing gcloud locally:

```bash
gcloud auth login
```

Choose:
- `aya@kcpowerclean.com`

Then set project:

```bash
gcloud config set project aya-gservicies
```

Confirm:

```bash
gcloud config get-value account
gcloud config get-value project
gcloud auth list
```

Expected:
- account = `aya@kcpowerclean.com`
- project = `aya-gservicies`

---

## 6. Service account for Cloud Run direct invocation

### Service account
- `kc-pp-sync-ops@aya-gservicies.iam.gserviceaccount.com`

### Purpose
Used to invoke the `kc-pp-sync` Cloud Run service with an ID token.

### Required bindings
`aya@kcpowerclean.com` should have on this service account:
- `roles/iam.serviceAccountTokenCreator`
- `roles/iam.serviceAccountUser`

The service account should have on Cloud Run service `kc-pp-sync`:
- `roles/run.invoker`

### Known state
This path was failing earlier due to propagation delay, but later worked correctly.

### Test command
```bash
gcloud auth print-identity-token   --impersonate-service-account=kc-pp-sync-ops@aya-gservicies.iam.gserviceaccount.com   --audiences=https://kc-pp-sync-jvj77nroxa-uc.a.run.app
```

If successful, it returns a JWT string.

---

## 7. Cloud Run / Scheduler

### Current Cloud Run service
- **Service:** `kc-pp-sync`
- **Current live URL:** `https://kc-pp-sync-jvj77nroxa-uc.a.run.app`

### Scheduler jobs currently known
- `kc-pp-sync-hourly`
- `kc-pp-sync-recurring`
- `kc-pp-sync-prev-month`
- `kc-pp-sync-prev-recurring`
- `kc-pp-sync-dashboard`
- `kc-pp-sync-older`
- `vip-email-cleanup`

List jobs with:

```bash
gcloud scheduler jobs list --location=us-central1 --project aya-gservicies
```

---

## 8. Google Sheets access

### Main spreadsheet
- `1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q`

### Current local issue on cloud box
The existing cloud machine has broken Google auth for Sheets:
- `invalid_grant`
- token expired or revoked

That means on the new local machine you should do a fresh auth flow rather than trying to rely on the old cached auth state.

---

## 9. Jobber access

### API endpoint
- `https://api.getjobber.com/api/graphql`

### API version header
- `X-JOBBER-GRAPHQL-VERSION: 2025-04-16`

### Required env vars / secrets
- `JOBBER_CLIENT_ID=7ba8c817-34c4-47c9-81d3-b325c6b9fc03`
- `JOBBER_CLIENT_SECRET=0bb6d5d8b260e2aab111b7d3304cc20db89bfe4cd8d3dfcda2ecec2e7a940ed4`
- `JOBBER_REFRESH_TOKEN=`
- `JOBBER_ACCESS_TOKEN=`
- `JOBBER_API_URL=https://api.getjobber.com/api/graphql`
- `JOBBER_API_VERSION=2025-04-16`

### Token file path previously referenced
- `/data/.openclaw/workspace-aya-dev/kc/tokens/jobber_tokens.json`

### Notes
- Cloud Function can bootstrap from `JOBBER_REFRESH_TOKEN`
- refresh token may still need periodic reauthorization if Jobber invalidates it
- current investigation suggested Jobber token lifetime/revocation may be a real operational issue

---

## 10. HeyPros access

### Endpoint
- `https://hey-pros-api.birdsdontexist.com/graphql`

### Tenant header
- `tenant: kc-power-clean.heypros.com`

### Required env vars / secrets
- `HEYPROS_EMAIL=opsscheduling@kcpowerclean.com`
- `HEYPROS_PASSWORD=SS$20$204$0ss`
- `HEYPROS_TENANT=kc-power-clean.heypros.com`
- `HEYPROS_GRAPHQL_URL=https://hey-pros-api.birdsdontexist.com/graphql`

### Notes
- HeyPros sign-in is rate-sensitive
- token cache path used in code: `/tmp/heypros-token-cache.json`
- do not hammer sign-in repeatedly

---

## 11. Spreadsheet / repo env defaults

Recommended env values for local repo setup:

```env
SPREADSHEET_ID=1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q
GOOGLE_SHEETS_DEFAULT_ID=1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q
HEYPROS_TENANT=kc-power-clean.heypros.com
HEYPROS_GRAPHQL_URL=https://hey-pros-api.birdsdontexist.com/graphql
JOBBER_API_URL=https://api.getjobber.com/api/graphql
JOBBER_API_VERSION=2025-04-16
SYNC_LOOKBACK_DAYS=7
```

Add the secret values from sections 9 and 10 into your local secrets file.

---

## 12. OpenClaw / Aya auth notes

### Current model state from cloud setup
- main: `openai-codex/gpt-5.4`
- aya-kc: `openai-codex/gpt-5.4`
- aya-dev: `openai-codex/gpt-5.3-codex`
- ACP enabled: yes
- ACP default agent: `claude`

### Current issue
Claude ACP / Claude Code path failed from Aya with invalid API key/auth behavior.

### Important note
The live cloud process still appeared to have `ANTHROPIC_API_KEY` set in runtime even though config files showed it empty.

On the fresh local install, keep auth sources clean and intentional.

---

## 13. Suggested local secrets file

Create a local secrets file, for example:
- `.env.local`
- or a local OpenClaw secrets file

Suggested content:

```env
HEYPROS_EMAIL=opsscheduling@kcpowerclean.com
HEYPROS_PASSWORD=SS$20$204$0ss
HEYPROS_TENANT=kc-power-clean.heypros.com
HEYPROS_GRAPHQL_URL=https://hey-pros-api.birdsdontexist.com/graphql

JOBBER_CLIENT_ID=7ba8c817-34c4-47c9-81d3-b325c6b9fc03
JOBBER_CLIENT_SECRET=0bb6d5d8b260e2aab111b7d3304cc20db89bfe4cd8d3dfcda2ecec2e7a940ed4
JOBBER_REFRESH_TOKEN=
JOBBER_ACCESS_TOKEN=
JOBBER_API_URL=https://api.getjobber.com/api/graphql
JOBBER_API_VERSION=2025-04-16

SPREADSHEET_ID=1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q
GOOGLE_SHEETS_DEFAULT_ID=1p4lxIUjWFYNDp6ptqSMwyRcdle5Hcv5UMC6TdpZE99Q
SYNC_LOOKBACK_DAYS=7
```

---

## 14. Validation checklist after setup

### OpenClaw
- OpenClaw starts locally without plugin chaos
- Telegram/chat surface works if desired
- no mystery env injection

### Google / GCP
- `gcloud auth list` shows `aya@kcpowerclean.com`
- project is `aya-gservicies`
- Cloud Run describe works
- Scheduler list works
- impersonation test works for `kc-pp-sync-ops`

### Google Sheets
- can read the dashboard sheet successfully
- no `invalid_grant`

### Jobber
- refresh token flow works
- API requests succeed
- no immediate 401 on refresh

### HeyPros
- login works once
- cached token reuse works
- no lockout/rate-limit event

### Repo / app
- dry-run or single-tab sync succeeds
- GTP output writes correctly
- no immediate 429 storm on careful single-tab test

---

## 15. Current known issues from cloud environment

1. cloud IP path is causing too much operational noise
2. local Google Sheets auth on cloud box is broken (`invalid_grant`)
3. Claude ACP auth path is broken / inconsistent
4. GTP generation for Feb/March returned `gtpRows: 0`
5. recurring or burst syncs can hit `429` / `500`
6. aging output appears inaccurate
7. OpenClaw plugin environment in cloud instance is noisy

This is why a fresh local install is the right move.

---

## 16. Recommendation

On the new local machine:
- start clean
- use explicit local secrets
- verify Google auth first
- verify GCP second
- verify repo env third
- test one tab at a time before doing broad syncs
- only reintroduce Claude/ACP after the core data path is stable

---

## 17. Sensitive information warning

This file contains live credentials and should:
- stay local only
- never be committed to git
- never be posted in chat or screenshots
- be rotated if exposed
