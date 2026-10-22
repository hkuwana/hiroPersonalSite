# Project Claude Code config

## Commands

- `/suggest-improvements [focus]` — audits global `~/.claude/` and this project's `.claude/`, plus `CLAUDE.md` / workflow docs, and proposes concrete improvements grounded in what it actually observes. Read-only; the user decides what to apply.

  Optional focus arg: `hooks`, `commands`, `skills`, `permissions`, or `all` (default).

The canonical copy lives at `~/.claude/commands/suggest-improvements.md` so it works in every project; this directory holds a version-controlled mirror.
