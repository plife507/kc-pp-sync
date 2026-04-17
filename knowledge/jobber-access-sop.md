# Jobber Access SOP

## Purpose
Global default procedure for connecting to Jobber from Aya, whether the request starts in AYA-HQ or Slack.

## Default interpretation
When Nathan asks to:
- connect to Jobber
- open Jobber
- check Jobber
- access invoices/jobs in Jobber

Default to this access model unless he explicitly asks for something else:

> **authenticated VPS host-browser access using OpenClaw browser tooling and the local Chromium install**

Do **not** default to:
- public website research
- plain `web_fetch`
- generic headless scraping language
- API access
- MCP/tool access

Those are separate modes and must be named explicitly if intended.

## Standard Jobber access path
1. Use OpenClaw `browser` tooling.
2. Use the **host** browser target.
3. Use the **openclaw** browser profile.
4. Navigate/interact with authenticated Jobber pages under `secure.getjobber.com`.
5. Treat browser session/profile state as sensitive and local-only.

## Canonical wording
Use this phrasing in future notes/replies:

> Jobber access is performed through an interactive authenticated browser session on the VPS using OpenClaw host-browser tooling and local Chromium/browser profile state.

## Decision rule
If the request is ambiguous, assume:
- **browser-authenticated access** for actual Jobber work
- **public-site research** only when Nathan is clearly asking about marketing pages/docs
- **API access** only when he explicitly asks about tokens, endpoints, integrations, or automation via API

## Failure policy
Do **not** silently switch access models.
If the documented Jobber host-browser path fails, fail out loud and ask/confirm before trying public-site or API mode.

## Cross-channel rule
This SOP applies across:
- AYA-HQ
- AYA-KC
- future Aya sessions in this workspace

Do not let channel context change the underlying Jobber access interpretation.

## Safety / handling
- Browser state may include cookies, local storage, history, IndexedDB, downloads, and screenshots.
- Keep browser state out of git.
- Keep credentials/tokens in `/data/.openclaw/secrets.env`, not markdown.

## If confusion happens
If another Aya session starts to collapse the categories, restate:

> Use the documented Jobber VPS host-browser access method, not public-site mode and not API mode.
