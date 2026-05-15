---
description: Audit Claude Code config (~/.claude, project .claude, CLAUDE.md, workflow docs) and propose concrete, observed improvements
argument-hint: "[focus: hooks|commands|skills|permissions|all]"
---

You are doing a focused audit of this user's Claude Code setup to find concrete, actionable improvements. Be specific — propose changes with file paths and short diffs, not generic advice. Do **not** implement anything; the user decides what to apply.

## Step 1 — Survey (parallel, skip missing silently)

Read:
- `~/.claude/settings.json`, `~/.claude/settings.local.json`
- `~/.claude/CLAUDE.md`
- `~/.claude/commands/` listing + each `.md`
- `~/.claude/agents/` listing + each `.md`
- `~/.claude/skills/` listing (and `SKILL.md` for any skill that looks under-described)
- Any hook scripts referenced from `settings.json` (resolve `~` paths, read the script)
- Current project's `.claude/` (settings, commands, agents) — if absent, note that
- Current project's `CLAUDE.md`, `README.md`, and any `docs/`/`CONTRIBUTING.md` workflow docs
- Project manifest (`package.json` / `pyproject.toml` / `Cargo.toml` / `Makefile`) — note scripts/targets referenced in CLAUDE.md or docs

If `$ARGUMENTS` is set, restrict the audit to that focus area; otherwise audit all.

## Step 2 — Look for these specific gaps

Flag only what you actually observe. No padding.

**Permissions hygiene**
- Frequent project commands (test, lint, build, format, typecheck, dev) not in `permissions.allow` → causes repeated prompts.
- Overly broad rules (bare `Bash` instead of `Bash(pnpm test:*)`).
- `Skill` allowed but no skills installed, or skills installed but `Skill` not allowed.

**Hooks**
- Hook scripts not `chmod +x`.
- Stop/SessionStart hooks that don't guard against edge cases (no remote, detached HEAD, recursion via `stop_hook_active`).
- Missing SessionStart hook for projects that need env priming (e.g. `pnpm install`, source `.envrc`).

**Slash commands**
- Repeated workflows in CLAUDE.md/README ("to deploy run X", "to test run Y") with no matching command.
- Standard test/lint/build/typecheck scripts in `package.json` but no `/test`, `/lint`, `/build` command.
- Existing commands missing frontmatter (`description`, `argument-hint`) or with vague prompts.

**CLAUDE.md**
- No project `CLAUDE.md` → suggest running `/init`.
- Existing `CLAUDE.md` missing: build/test/lint commands, key paths, conventions, no-go zones, branching rules.

**Skills & agents**
- Multi-step workflows the user repeats → candidate skill.
- Custom review/research patterns → candidate sub-agent in `~/.claude/agents/`.

**Project hygiene**
- `.claude/settings.local.json` tracked in git (should usually be gitignored).
- Secret-leak risk in hooks/commands (e.g. logging `env`, echoing tokens).

**Session signal (if available)**
- If `~/.claude/sessions/` or shell-snapshots are readable, scan for repeat permission prompts or repeated manual commands — those are the highest-leverage gaps.

## Step 3 — Report (use this exact structure)

```
# Claude Code setup audit

## Inventory
- <≤6 bullets of what exists today>

## Recommendations
1. **<title>** [scope: global|project|both] [effort: 1min|5min|15min]
   - Why: <one sentence, grounded in something observed>
   - Change: <file path + short diff or snippet>
   - Skip if: <when it wouldn't apply — omit line if always applies>

(max 5; if more, append a one-line "Minor items omitted: …")

## Already solid
- <≤4 bullets of things worth keeping — omit section if nothing notable>
```

## Constraints

- Ground every recommendation in something you actually read. No evidence → no recommendation.
- No generic advice ("add tests", "improve docs"). Specific gaps only.
- Cap the report at ~40 lines.
- Do not edit any files. Report only.
