# Google Runtime Authority

Purpose: one compact canonical reference for Google access relevant to this workspace style of operation.

## 1. Google Workspace runtime authority
Use:
- `/data/.openclaw/workspace/bin/gog-aya ...`

Applies to:
- Gmail
- Drive
- Sheets
- Docs
- Calendar
- Contacts / People

Why:
- avoids PATH drift
- preserves current working keyring behavior
- standardizes access across Aya sessions

## 2. Gog auth rule
Current Aya token behavior:
- file keyring backend
- blank file-keyring password

So manual fallback, only if truly needed, is:
```bash
export GOG_KEYRING_BACKEND=file
export GOG_KEYRING_PASSWORD=""
export GOG_ACCOUNT=aya@kcpowerclean.com
```

Do **not** load `gog-keyring-password.txt` into `GOG_KEYRING_PASSWORD` for the current Aya token.
That can cause decrypt / integrity-check failures.

## 3. Raw Gog binary
Underlying binary:
- `/home/linuxbrew/.linuxbrew/bin/gog`

Use raw binary mainly for:
- diagnostics
- confirming install/path state
- command-shape reference

Normal workspace operations should still use the wrapper.

## 4. Google Cloud runtime authority
Use:
- `gcloud ...`

## 5. Read/write policy
Google Workspace actions:
- default to `gog-aya`
- fail out loud if that path fails
- do not silently switch to browser mode

Google Cloud actions:
- use `gcloud`
- authenticate explicitly when cloud project/admin work is needed

## 6. One-line truth
- Google Workspace -> `/data/.openclaw/workspace/bin/gog-aya ...`
- Google Cloud -> `gcloud ...`
