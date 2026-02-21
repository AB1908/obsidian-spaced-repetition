# Plan: Deterministic Modularization + Domain Model Evolution

**Date:** 2026-02-18  
**Status:** Proposed  
**Scope:** Phase A implementation-ready, Phase B-D design-ready

## Why This Plan

The codebase has long files with mixed concerns (`AnnotationsNote.ts`, `api.ts`) and naming drift (`book` metaphors for non-book sources).  
We want to reduce complexity safely first, then evolve the domain model.

This plan intentionally separates:
1. **Phase A:** deterministic, low-risk file/module extraction (no behavior changes)
2. **Phase B-D:** model redesign and ownership changes

## Goals

1. Make structure understandable without changing runtime behavior.
2. Keep drift risk near zero using deterministic mechanics and strict gates.
3. Prepare clean seams for `FlashcardSource`-style extensibility.

## Non-Goals (Phase A)

1. No API contract changes.
2. No semantic changes to parsing/review/scheduling behavior.
3. No renaming of public route/API concepts yet.

## Deterministic Refactor Protocol (Phase A)

### Core Rules

1. Move code only; do not alter signatures or logic.
2. One extraction unit per commit (small and reversible).
3. Require green checks after every commit:
   - `tsc --noEmit`
   - focused tests for touched area
   - full `npm test` at milestone boundaries
4. Any incidental cleanup is deferred unless required for compile.

### Tooling Strategy

1. **Primary:** TypeScript language service/LSP rename and import-update.
2. **Secondary:** codemod (`ts-morph` or `jscodeshift`) for repetitive import rewrites.
3. **Validation:** compiler + tests; no AI-generated semantic rewrites during Phase A.

### Suggested Automation Helpers

1. `scripts/refactor/move-export.ts` (optional): scripted export move + import rewrite.
2. `scripts/refactor/check-no-semantic-diff.sh` (optional): compile, lint, targeted tests.

## Phase A Work Packages

## A1: Split `AnnotationsNote.ts` by concern (move-only)

Target modules:
1. `src/data/models/sections/types.ts`
2. `src/data/models/sections/guards.ts`
3. `src/data/models/sections/heading-graph.ts` (`findPreviousHeader*`, `findNextHeader`, `generateHeaderCounts`)
4. `src/data/models/sections/book-sections.ts` (`bookSections`)
5. `src/data/models/annotations-note/AnnotationsNote.ts` (class only)
6. `src/data/models/annotations-note/AnnotationsNoteIndex.ts`

Checkpoint:
1. Existing tests pass with identical behavior snapshots.

## A2: Split `api.ts` into application services (move-only)

Target modules:
1. `src/application/review-api.ts`
2. `src/application/source-api.ts`
3. `src/application/navigation-api.ts`
4. `src/application/import-api.ts`
5. `src/application/deck-creation-api.ts`
6. `src/api.ts` becomes a thin re-export/facade.

Checkpoint:
1. Route-level tests and API tests remain unchanged.

## A3: Normalize naming at file boundaries only (no contract change)

1. Introduce internal aliases (`SourceRecord`, `SectionNode`) while preserving exported old names.
2. Add deprecation comments on legacy names (`book`, `frontbook`) but do not remove yet.

Checkpoint:
1. No external call sites break.

## A4: Documentation + map of module ownership

1. Add `docs/guides/architecture/domain-module-map.md` with module responsibilities.
2. Include dependency direction rules.

Checkpoint:
1. Architecture map agrees with actual import graph.

## Phase A Exit Criteria

1. No behavior regressions (test suite green).
2. `AnnotationsNote.ts` and `api.ts` are both < 250 lines each (thin coordination only).
3. Section parsing, navigation, review orchestration live in distinct files.
4. Clear seam exists for model changes without mass edits.

## Phase B-D Design Space (Post-Extraction)

## Candidate Direction: `FlashcardSource` Composition Model

`FlashcardSource` composes three responsibilities:
1. `SourceContentStrategy` (extract/sync/navigable sections)
2. `FlashcardStore` (card persistence + scheduling metadata writes)
3. `ReviewSession` (in-memory review state machine)

This keeps extensibility while avoiding one bloated interface.

## Alternative Architectures + Tradeoffs

1. Keep current aggregate, only cleaner files.
   - Best when: velocity pressure is high, source variety is low.
   - Cost: conceptual debt remains; harder long-term evolution.

2. Class-per-source inheritance (`MarkdownFlashcardSource`, `MoonReaderFlashcardSource`).
   - Best when: behavior diverges significantly and remains stable.
   - Cost: duplication and inheritance rigidity.

3. Functional core + discriminated unions.
   - Best when: you want maximal testability and TS idiomatic modeling.
   - Cost: larger migration; more explicit state plumbing.

4. Composition + narrow interfaces (recommended).
   - Best when: continuous source expansion is expected.
   - Cost: more modules; requires disciplined boundaries.

## Pain-Driven Choice Guide

1. Pain: “Hard to find code”
   - Choose: Phase A only first; no model rewrite yet.

2. Pain: “Adding a new source type creates conditionals everywhere”
   - Choose: composition model with `FlashcardSource`.

3. Pain: “Type churn and interface bloat”
   - Choose: discriminated unions + minimal interfaces; avoid marker interfaces.

4. Pain: “Runtime bugs from state coupling”
   - Choose: extract `ReviewSession` and keep state local to one service.

## Specific Notes from Current System

1. `Heading` currently has data only; a class is likely unnecessary after Phase A.
2. Source mutation logic in deck creation is an application/domain seam candidate, not API facade logic.
3. `Source` class exists but is currently underused; Phase B should either integrate it fully or remove it.

## Phase B-D Draft Sequence (for later execution)

1. B1: Introduce `FlashcardSource` interface and adapter wrappers over existing classes.
2. B2: Extract `ReviewSession` from `AnnotationsNote`.
3. B3: Move source mutation/prepare-for-deck logic behind source strategies.
4. C1: Replace `Heading` class with a plain type + pure graph functions.
5. C2: Rename domain terms (`book`/`frontbook`) to source-neutral terms.
6. D1: Remove deprecated aliases and finalize contracts.

## Risk Controls

1. Golden tests for navigation and deck creation before Phase B.
2. Snapshot/contract tests for API response shapes.
3. Incremental branch/PR sizing: max 1-2 extraction units per PR.
4. “Stop rule”: if behavior changes are discovered in Phase A, revert to previous green commit and split smaller.

## Immediate Next Actions

1. Approve this plan as the execution baseline.
2. Start A1 with the smallest extraction: `sections/guards.ts` + `sections/types.ts`.
3. Run focused tests after each move; run full suite at A1 and A2 completion.
