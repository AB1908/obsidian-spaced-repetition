# META-028: Version Control for ~/.claude Configuration

## Status
Proposed

## Epic
None

## Description

The `~/.claude/` directory contains workflow-critical configuration that is currently
untracked and unversioned. A corrupted settings file or OS reinstall would silently
lose all of this work with no recovery path.

### What lives in ~/.claude/ that matters

| Path | Contents | Risk if lost |
|------|----------|-------------|
| `settings.json` | Permissions, all hooks (SessionStart, Notification, PostToolUse) | High — hooks rebuilt from scratch |
| `hooks/notify-once.sh` | Dedup notification logic | Medium |
| `hooks/session-start.sh` | Session orientation hook | Medium |
| `scripts/summarize-session.sh` | Gemini-based session summarizer | Medium |
| `projects/*/sessions-index.md` | Human-readable session index per project | Low — rebuildable via script |

### Options

**Option A: Dotfiles repo**
Add `~/.claude/` (or relevant subdirs) to a personal dotfiles git repo.
Portable, standard practice, works across machines.

**Option B: Symlink into project repo**
Symlink `~/.claude/hooks/` and `~/.claude/scripts/` into the project repo
under `.claude/`. Keeps workflow tooling alongside the code it serves.
Downside: conflates personal config with project config.

**Option C: Export script**
A script that snapshots `~/.claude/` to a known backup location on demand.
Lower friction than a dotfiles repo but no automatic versioning.

### Recommendation

Option A (dotfiles repo) for `settings.json`, hooks, and scripts.
Per-project `sessions-index.md` stays in `~/.claude/projects/` — too
project-specific for a global dotfiles repo.

## Acceptance Criteria

- [ ] `~/.claude/settings.json` version controlled
- [ ] `~/.claude/hooks/` version controlled
- [ ] `~/.claude/scripts/` version controlled
- [ ] Recovery documented: how to restore from dotfiles repo on a new machine
- [ ] `sessions-index.md` excluded (project-specific, rebuildable)

## Likely Touchpoints

- Personal dotfiles repo (new or existing)
- `~/.claude/settings.json`
- `~/.claude/hooks/`
- `~/.claude/scripts/`

## Related

- META-025 — session management tooling (scripts at risk)
- META-027 — custom subagents (future `.claude/agents/` also needs versioning)
