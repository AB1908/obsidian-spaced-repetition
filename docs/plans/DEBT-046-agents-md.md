# Plan: DEBT-046 — Expand AGENTS.md

## Current State

`AGENTS.md` contains only 3 lines covering release policy. Agent orientation is split
across `CLAUDE.md`, `GEMINI.md`, and `.claude/agents.md` with no single entry point.

## New AGENTS.md Content

```markdown
# AGENTS.md

**Start here.** This is the canonical orientation file for all AI agents working in this
repository. Read this first, then follow the role-specific pointer that applies to you.

---

## Project

**Card Coverage** is an Obsidian plugin for spaced repetition learning. It creates flashcards
from book annotations (primarily Moon+ Reader exports) and tracks highlight memorization.

- Language: TypeScript + React (functional components)
- Plugin host: Obsidian API — all file I/O goes through `app.vault` / `app.fileManager`
- Entry point: `src/main.ts`

---

## Essential Commands

\`\`\`bash
npm run build        # Production build (esbuild)
npm run dev          # Watch mode build
npm test             # Full Jest test suite
npm run watch        # Jest in watch mode
npm run format       # Prettier formatting
npm run lint         # Check formatting
\`\`\`

**Before committing:** run `npm test` and confirm all tests pass.

---

## Architectural Context

Three-layer architecture: UI (`src/ui/`) → API facade (`src/api.ts`) → Data models (`src/data/`).

Key files:
- `src/main.ts` — Obsidian plugin entry point
- `src/api.ts` — orchestration facade (being gradually decomposed)
- `src/data/models/sourceNote.ts` — core book/annotation model
- `src/data/models/flashcard.ts` — flashcard CRUD model
- `src/data/disk.ts` — vault filesystem abstraction (mock this in tests)

Full architecture: `docs/guides/architecture/system_overview.md`
Architecture decisions: `docs/decisions/ADR-*.md`

---

## Work Organization

Stories (features, bugs, debt, spikes) live in `docs/stories/`. Check status:

\`\`\`bash
./scripts/project-status.sh --brief    # Session-start orientation
./scripts/story-catalog.sh list        # All stories
\`\`\`

Active work: files with `Status: In Progress` in `docs/stories/`.

---

## Release Policy (All Agents)

For release automation tasks, use `docs/guides/release-playbook.md` as the canonical
instruction set. Do not create or push release tags unless `manifest.json.version`
matches the tag exactly.

---

## Role-Specific Orientation

### Claude Code

Read **`CLAUDE.md`** for the full operational guide. It covers:
- Commit approval workflow (mandatory `/commit` skill)
- Story lifecycle and commit type conventions
- Fixture-based test mocking patterns
- Delegation to Codex (when and how)

Also read **`.claude/agents.md`** for:
- Claude Code / Codex role split (what each agent owns)
- Delegation decision framework and pre-delegation checklist
- Plan quality standards required before delegating
- Operation tiers (token cost classification)

### Gemini

Read **`GEMINI.md`** for Gemini-specific operational principles:
- Atomic commits and verify-then-commit workflow
- Feature lifecycle (branch → work → cleanup → merge)
- Domain model decomposition goals

### Other Agents (GPT-based, Codex standalone, etc.)

Key invariants regardless of agent type:
1. Run `npm test` before committing. Never commit with failing tests.
2. Commits must be atomic — one logical change per commit.
3. All file I/O must use `src/data/disk.ts` abstractions, not Node `fs` directly.
4. Do not modify `manifest.json` version or create release tags without explicit instruction.
```

## Additional Changes

- Add one-liner to top of `CLAUDE.md`: `> Agent orientation: read AGENTS.md first.`
- Add one-liner to top of `GEMINI.md`: `> Agent orientation: read AGENTS.md first.`

## Note on `npm run check`

The AC mentions `npm run check` but that script doesn't exist yet (DEBT-043). Use `npm test`
for now; update AGENTS.md when DEBT-043 lands.

## Commit Structure

1. `docs: expand AGENTS.md as canonical agent orientation entry point`
2. `docs: add AGENTS.md reference to CLAUDE.md and GEMINI.md`
