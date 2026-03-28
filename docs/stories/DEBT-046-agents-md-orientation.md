# DEBT-046: Expand AGENTS.md as canonical agent orientation entry point

## Status
Done

## Reviewed
No

## Epic
None

## Description
`AGENTS.md` exists but contains only 3 lines covering release policy. The actual agent orientation is split across `CLAUDE.md`, `GEMINI.md`, and `.claude/agents.md` with no single canonical entry point. An agent starting a session must know to look in multiple places.

The file should either:
- Become the canonical orientation file with build/test/run commands and role-specific pointers, or
- Explicitly redirect each agent type to the right starting file (e.g., "Claude Code: read CLAUDE.md first. Gemini: read GEMINI.md first. All agents: read .claude/agents.md for delegation conventions.")

Currently, a new agent type (e.g., GPT-based, Codex) has no clear starting point.

## Acceptance Criteria
- [ ] `AGENTS.md` is the first file any agent should read to orient itself
- [ ] It includes: how to build (`npm run build`), how to test (`npm run check`), where to find architectural context, and role-specific pointers
- [ ] It explicitly names `CLAUDE.md`, `GEMINI.md`, and `.claude/agents.md` and describes what each covers
- [ ] CLAUDE.md and GEMINI.md reference AGENTS.md as the shared entry point

## Likely Touchpoints
- `AGENTS.md`
- `CLAUDE.md`
- `GEMINI.md`

## Related
- [DEBT-041](DEBT-041-scripted-environment-setup.md)
