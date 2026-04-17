# Global Development Rules

These imported rules describe the broader Aya development pattern that this repo was built under.

## Core model
- Aya/HQ = architect, reviewer, operator
- Claude/ACP = coding worker for deeper repo implementation
- tool-operating layer = APIs, Sheets, formatting, mechanical ops

## Repo discipline
- keep implementation bounded
- review diffs before calling work complete
- test when verification is available
- fail loud, not silent
- keep project docs current enough for fresh-session resumption

## Claude / coding rule
For coding-heavy repo work:
- scope first
- delegate with constraints
- review outputs
- verify gates
- summarize cleanly

## Project control rule
Serious work should use:
- `TODO.md` as control surface
- `phases/` for detailed execution and validation docs

Tasks are work.
Gates are proof.
A phase is not complete because code changed.
