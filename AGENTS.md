# AGENTS.md

This is the shared orientation entry point for all agents (Claude Code, Gemini, Codex, and others).
Read this file first. Then follow the pointer for your agent type.

---

## Environment Setup

After cloning, install dependencies before running any commands:

```bash
scripts/setup.sh         # Runs npm ci and validates node_modules
```

## Build and Test Commands

```bash
npm run build            # Production build
npm run check            # Lint + typecheck + full test suite (run before committing)
npm test                 # Run Jest suite only
npm run typecheck        # TypeScript type check (tsc --noEmit)
npm run lint             # Prettier format check
```

`npm run check` is the canonical pre-commit gate. It must pass before any commit or push.

## Architecture

Three-layer architecture: UI (`src/ui/`) → API facade (`src/api.ts`) → Data models (`src/data/`).

Key files:
- `src/api.ts` — orchestration layer between UI and data models
- `src/data/disk.ts` — all vault filesystem operations (Obsidian API abstraction)
- `src/data/models/` — core business models (`sourceNote.ts`, `flashcard.ts`)
- `src/main.ts` — Obsidian plugin entry point

Full architecture overview: `docs/guides/architecture/system_overview.md`

## Documentation Layout

```
docs/
├── decisions/     # Architecture Decision Records (ADRs)
├── stories/       # All work items: STORY, BUG, DEBT, SPIKE
├── guides/        # Reference: testing, workflow, architecture
└── plans/         # Scoping and test-contract documents for stories
```

## Release Policy (All Agents)

For release automation tasks, use `docs/guides/release-playbook.md` as the canonical instruction set.
Do not create or push release tags unless `manifest.json.version` matches the tag exactly.

---

## Agent-Specific Pointers

**Claude Code:** Read `CLAUDE.md` for commit approval workflow, story lifecycle, session start
commands, and Claude-specific delegation rules. Also read `.claude/agents.md` for the
Claude/Codex role split and delegation decision framework.

**Gemini:** Read `GEMINI.md` for operational principles, commit conventions, architecture
context, and the mock server workflow.

**Codex / other agents:** The above files cover all conventions. Start with `CLAUDE.md` for
the most complete orientation, then `AGENTS.md` (this file) for shared commands.
