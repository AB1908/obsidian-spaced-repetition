# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Card Coverage** is an Obsidian plugin for spaced repetition learning that applies the concept of test coverage to reading. It creates flashcards from book annotations (primarily exported from Moon+ Reader) and tracks what percentage of your highlights you've memorized.

**Key Characteristics:**
- TypeScript + React (functional components)
- Obsidian plugin architecture
- Depends on Moon Reader plugin exports for annotation import
- Files tagged with `review/book` are expected inside book-specific folders
- Not backwards compatible with legacy Obsidian SRS plugin

## Essential Commands

```bash
# Development
npm run dev              # Start esbuild in watch mode
npm run build            # Production build

# Testing
npm test                 # Run full Jest suite
npm run watch            # Jest in watch mode

# Code Quality
npm run format           # Format with Prettier
npm run lint             # Check formatting

# Releases
npm run release          # Standard-version for versioning

# UI Development (Mock Mode)
npm run mock-server      # Start json-server on :3000 with db.json
```

**Mock API Usage:** Set `USE_JSON_MOCK = true` in `src/ui/routes/books/review/index.tsx` and run `npm run mock-server` to develop UI against mock data.

## Release Protocol

For any release operation (version bumps, tags, release fixes), follow `docs/guides/release-playbook.md` as the single source of truth.

## Architecture Overview

### Three-Layer Architecture

**1. UI Layer** (`src/ui/`, `src/routes/`)
- React functional components (`.tsx`)
- `react-router-dom` for routing and data loading
- Route definitions in `src/routes/routes.tsx`
- Components call API layer via `loader` functions

**2. API/Facade Layer** (`src/api.ts`)
- Bridge between UI and data models
- Orchestrates calls to underlying models and services
- Exposes functions like `getAnnotationById`, `updateAnnotationMetadata`
- Hides data layer complexity from UI

**3. Data Model Layer** (`src/data/`)
- **Models** (`src/data/models/`):
  - `sourceNote.ts`: Core model representing a book/document with annotations
  - `flashcard.ts`: Flashcard and FlashcardNote classes
  - **Indexes**: `SourceNoteIndex` and `FlashcardIndex` act as in-memory databases
- **Disk Abstraction** (`src/data/disk.ts`):
  - Facade for all Obsidian vault filesystem operations
  - Isolates core logic from Obsidian API specifics
  - Critical for testing (easily mocked)
- **Parsers** (`src/data/parser.ts`, `src/data/import/`):
  - Parse markdown, extract metadata, handle MoonReader imports

**Data Flow Example** (updating an annotation):
1. User edits note in `PersonalNotePage` component (UI)
2. Save handler calls `updateAnnotationMetadata` (API layer)
3. API retrieves `SourceNote` instance from `SourceNoteIndex`
4. Calls `sourceNote.updateAnnotation()` (Data Model)
5. Model updates in-memory state, renders markdown
6. Calls `updateCardOnDisk` from `disk.ts` (writes to vault)

### Key Directories

```
src/
├── api.ts              # Main API facade (gradually being refactored)
├── main.ts             # Obsidian plugin entry point
├── settings.ts         # Plugin settings management
├── config/             # Configuration
├── data/
│   ├── disk.ts         # Vault filesystem abstraction
│   ├── models/         # Core business models
│   ├── import/         # Import parsers (MoonReader)
│   └── parser.ts       # Markdown parsing
├── scheduler/          # Spaced repetition algorithm
├── ui/                 # React components and routes
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## Documentation & Work Organization

**"Commits tell WHAT changed. Documentation tells WHY."**

Three directories, lifecycle-driven:

```
docs/
├── decisions/     # Architecture Decision Records (immutable once accepted)
├── stories/       # ALL work items: features, bugs, debt (one file per item)
└── guides/        # Reference: testing, workflow, architecture, conventions
```

Plus `docs/archive/` for completed or stale context.

### Session Start Workflow

Run `./scripts/project-status.sh --brief` for a minimal session-start orientation (~8 lines). Use `--release` to include release plan items. These replace per-file grepping and minimize token usage on session start.

For deeper investigation:
1. **Dependency check** — read `Depends on:` fields in relevant stories, flag blockers
2. **Propose work order** — topological sort of ready items
3. **Execution discipline reminder** — for multi-commit work, run at least one mid-run plan divergence check; before merge, confirm session note + story status + changelog updates.

### Story File Prefixes

- `STORY` — feature work
- `BUG` — confirmed defects
- `DEBT` — technical debt
- `SPIKE` — time-boxed research

### Commit Convention

```
<type>(<scope>): <what changed in 5-10 words>
```

**Standard types** (appear in CHANGELOG): `feat`, `fix`, `refactor`

**Infra types** (hidden from CHANGELOG): `chore`, `docs`, `test`, `style`, `perf`

**LLM workflow types** (hidden from CHANGELOG):
- `plan:` — scope files, test contracts, ADRs, session plans
- `story:` — story lifecycle events (create, update, close, archive)
- `wf:` — workflow tooling (hooks, scripts, skills, delegation infrastructure)

`docs:` is for genuine reference documentation only (guides, README, CLAUDE.md).

**Full details:** See `docs/guides/work-organization.md` and `docs/guides/workflow.md`

## Testing

### Test Structure
- **Framework:** Jest + React Testing Library
- **Location:** `tests/` directory mirrors `src/` structure
- **Config:** `jest.config.js`

### Fixture-Based Mocking

The project uses `createDiskMockFromFixtures` (in `tests/helpers.ts`) to mock disk operations:

1. Create JSON fixture in `tests/fixtures/[method-name].json`
2. Define `method`, `input` (args array), and `output` (return value)
3. Register fixture filename in test's `createDiskMockFromFixtures` call

**Example:** To mock `deleteCardOnDisk(path, text)`:
```json
{
  "method": "deleteCardOnDisk",
  "input": ["path/to/file.md", "card text content"],
  "output": null
}
```

### Common Patterns

- **Global Setup:** Most tests use `newFunction()` in `beforeEach` to create fully-populated plugin state
- **Flaky Tests:** Mock `Math.random()` for deterministic card shuffling in review tests
- **Test Guide:** See `docs/testing_guide.md` for detailed patterns

### Running Tests
```bash
npm test                    # Full suite
npm run watch               # Watch mode
npm test -- annotation      # Filter by pattern
```

## Key Architectural Decisions

Refer to `docs/decisions/` for full ADRs. Recent important decisions:

- **ADR-018:** Source model architecture (in progress)
- **ADR-017:** MoonReader parser refactor
- **ADR-016:** Sidecar annotation architecture

## Development Principles

1. **Atomic Commits:** Each commit should be a single logical change
2. **Test-Driven Stability:** Run `npm test` before committing
3. **Route-Based Feature Modules:** Each route is a feature with its own directory
4. **Domain Model Decomposition:** Moving business logic from `api.ts` into cohesive models (`SourceNote`, `FlashcardNote`)
5. **Separation of Concerns:** `api.ts` should orchestrate, not implement. Delegate to models.

## Commit Approval Workflow (MANDATORY)

**Use the `/commit` skill** — it enforces all rules below as primary context, preventing
convention drift that occurs when committing mid-session.

### Rules (enforced by skill + hooks)

- **No short codes in subject.** `BUG-###`, `STORY-###`, `DEBT-###`, `META-###` etc. are banned.
  Put them in docs or the commit body as `Closes: META-029`. Never in the subject.
- **Subject ≤ 72 chars**, 1-2 lines max.
- **Valid type prefix required:** `feat` | `fix` | `refactor` | `perf` | `chore` | `docs` | `test` | `style` | `plan` | `story` | `wf`
- Details go in documentation, not commit messages.

### What the skill does

1. Reads staged diff, drafts subject, self-validates against rules above
2. Writes `.commit-approval` file
3. Shows proposed message + files — waits for your approval
4. Executes `git commit` after approval

### Hooks Enforce This

- **Pre-commit hook:** Blocks if no `.commit-approval` file (< 5 min old); validates message from approval file
- **Commit-msg hook:** Validates final message length and short-code rules
- **Bypass:** Use `--no-verify` only for emergencies

## Important Constraints

- **Obsidian API:** All file operations must go through `app.vault` and `app.fileManager`
- **File Structure:** Annotations must be in `review/book` tagged files inside book-specific folders
- **Moon Reader Dependency:** Plugin expects export format from AB1908's Moon Reader plugin
- **No Legacy Support:** Legacy `#flashcard` format from original SRS plugin not supported
- **Mobile Support:** First-class mobile support is a priority

## Current State & Tech Debt

See `docs/todo/technical_debt.md` for current issues.

**Known Issues:**
- Annotation navigation doesn't respect filters applied in list view
- `api.ts` is large and being gradually refactored into domain models

**Active Work:** Check `docs/context/` for in-progress features.

## Quick Reference

**Find active work:**
```bash
grep -l "Status: In Progress" docs/stories/*
grep -l "Status: Ready" docs/stories/*
ls docs/stories/
```

**Find architectural context:**
```bash
cat docs/decisions/ADR-*.md
cat docs/guides/architecture/system_overview.md
```

**Find related code:**
```bash
# Use path aliases
import { X } from "src/data/models/AnnotationsNote"
```

## Additional Resources

- **Main README:** `README.md` - User-facing overview and installation
- **Changelog:** `CHANGELOG.md` - Version history and changes
- **System Overview:** `docs/guides/architecture/system_overview.md`
- **Testing Guide:** `docs/guides/testing.md`
- **Agent Workflow:** `.claude/agents.md` — delegation decisions, plan quality standards, pre-delegation checklist
- **Git Workflow:** `docs/guides/workflow.md`
- **Work Organization:** `docs/guides/work-organization.md`
- **Obsidian API Notes:** `docs/guides/obsidian-api-notes.md`
- **Testing Notes:** `docs/guides/testing-notes.md`
- **Stories/Backlog:** `docs/stories/`
