# META-025: Session Management Tooling

## Status
Done

## Epic
None

## Description

Claude Code sessions accumulate as UUID-named `.jsonl` files with no human-readable
index. After ~30 sessions it becomes impossible to find the right one to resume without
reading raw JSON. This story tracks the session management tooling built to address that.

### What was built

**`~/.claude/scripts/summarize-session.sh`**
- Extracts readable transcript from a `.jsonl` session file (skips tool calls, meta-commands)
- Sends to Gemini (`gemini-2.0-flash`) for title + summary + resume_worthy assessment
- Output: JSON with `title`, `summary`, `resume_worthy` fields
- Usage: `summarize-session.sh <session.jsonl>`

**`sessions-index.md`** (per-project, in `~/.claude/projects/<proj>/`)
- Human-readable table: date, short UUID, size, title, resume worthiness
- Populated by running `summarize-session.sh` over unknown sessions
- Manually maintained going forward

**Session picker in `claude-mobile.sh`**
- Replaces blind "resume last session? y/N" prompt
- Parses `sessions-index.md` and shows numbered menu
- User picks by number; resolves short UUID to full filename for `--resume`
- Falls back to last-session prompt if no index exists

### Archival

Stub sessions (<3KB, no real content) moved to:
`~/.claude/archive/sessions/<project>/`
for later bulk review via `summarize-session.sh`.

### Known gaps

- `sessions-index.md` requires manual updates when new sessions are created
- No `Stop` hook yet to auto-append new sessions to the index
- Script doesn't support `--update-index` batch mode yet (stubbed in help text)

## Acceptance Criteria

- [x] `summarize-session.sh` working with Gemini CLI
- [x] `sessions-index.md` populated for obsidian-spaced-repetition project
- [x] Session picker integrated into `claude-mobile.sh`
- [x] Stub sessions archived
- [ ] `Stop` hook appends new session to index automatically

## Likely Touchpoints

- `~/.claude/scripts/summarize-session.sh`
- `~/.claude/projects/-home-abhishek-github-obsidian-spaced-repetition/sessions-index.md`
- `claude-mobile.sh`
- `~/.claude/settings.json` (Stop hook, when added)

## Related

- META-024 — commit taxonomy (same session)
