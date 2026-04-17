# Knowledge Imports

This folder holds copied-in operational knowledge that is useful for maintaining `kc-pp-sync` but did not originally live inside this repo.

Purpose:
- reduce hidden workspace-only knowledge
- make the repo more self-contained for future Aya / ACP Claude work
- preserve project-relevant SOPs without mixing them into project-native reference docs

## What belongs here

- access SOPs that affect how this project is operated
- browser/API/runtime authority notes relevant to the stack
- Google Workspace / Google runtime notes relevant to Sheets-based operation
- development workflow standards if they materially affect how changes should be executed in this repo

## What does NOT belong here

- secrets
- tokens
- browser profiles
- raw workspace memory
- unrelated KC or HQ docs
- noisy historical scratch notes

## Current imports

- `jobber-access-sop.md`
- `jobber-browser-access-notes.md`
- `google-runtime-authority.md`
- `google-workspace-access-sop.md`
- `global-development-rules.md`
- `non-negotiable-development-model.md`
- `STACK-QUICKSTART.md`
- `WHAT-IS-MISSING.md`

## How to use this folder

- Use `references/` for repo-native operational truth and project-specific mappings.
- Use `knowledge/` for imported supporting authority and SOP material.
- If an imported file becomes deeply project-specific, convert it into a repo-native doc under `references/` or root docs.
