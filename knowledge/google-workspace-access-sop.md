# Google Workspace Access SOP

## Purpose
Default procedure for Google Workspace actions relevant to this repo's operating environment.

## Default interpretation
When work involves:
- Gmail
- Calendar
- Drive
- Contacts
- Sheets
- Docs
- Google Workspace

Default to the **gog CLI path** unless Nathan explicitly asks for another method.

## Standard access path
Use the `gog` CLI / Google Workspace skill for:
- Gmail search/read/send
- Calendar reads and event work
- Drive search/file access
- Contacts lookup
- Sheets read/update/append/clear
- Docs read/export/copy

### Host runtime standard
Prefer:
- `/data/.openclaw/workspace/bin/gog-aya ...`

Manual fallback only if truly needed:
- `GOG_KEYRING_BACKEND=file`
- `GOG_KEYRING_PASSWORD=""`
- `GOG_ACCOUNT=aya@kcpowerclean.com`

## Do not default to
- browser/UI automation
- generic web browsing
- scraping Google web apps
- ad hoc API code

## Safety / handling
- Confirm before sending email or creating calendar events.
- Prefer structured CLI reads/writes over browser interaction.
- Keep Google credentials/secrets out of markdown and git.
- Do not silently switch to browser mode if the default path fails.
