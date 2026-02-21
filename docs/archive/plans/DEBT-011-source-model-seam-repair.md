# Plan: Source Model Seam Repair

**Stories:** DEBT-011, DEBT-001, DEBT-013
**Date:** 2026-02-16
**ADRs:** ADR-018 (composition/strategy pattern — accepted)

## Context

STORY-010 (Direct Markdown Engagement) has core infrastructure done, but the navigation/API layer assumes a MoonReader book model. Two source types share one model (`AnnotationsNote`) with behavior differences handled by scattered conditionals in `api.ts`. The strategy pattern (`ISourceStrategy`) only covers import-time operations, leaving 4 other lifecycle points unaddressed.

## Behavior Divergence Inventory

| Lifecycle Point | MoonReader | Markdown | Currently lives |
|---|---|---|---|
| Import | `.mrexpt` sync/extract | N/A (tag discovery) | Strategy (works) |
| Navigation | Level-1 headings only | All headings | `api.ts` conditional |
| Deck creation | No mutation | Block ID injection + folder move | `api.ts` free functions |
| Rendering | Callout format | Plain paragraph | `renderAnnotation()` — **broken for paragraphs** |
| Mutation confirmation | Not required | Required | `api.ts` conditional |

## Key Findings

- `bookSections` is a god-array `(Heading | annotation | paragraph)[]` with duck-typed guards — no discriminator field
- `updateAnnotation()` calls `renderAnnotation()` which outputs callout format — broken for paragraphs
- `transform()` (AnnotationsNote.ts:72-84) makes paragraphs masquerade as annotations
- `Source` class and `MarkdownSourceStrategy` exist but are dead code — never integrated
- ADR-018 chose composition — exploration confirms this is right

## Execution: 2-Wave Parallel Plan

### Parallelism Analysis

**File-region conflict matrix:**

| File | PR 1 region | PR 2 region | PR 3 region | PR 4 region |
|---|---|---|---|---|
| `AnnotationsNote.ts` | types (25-26), guards (52-70), Heading (133-148) | class field + initialize (270-339) | — | transform (72-84), methods (374-414, 564-582) |
| `ISourceStrategy.ts` | — | append method | append method | — |
| `MoonReaderStrategy.ts` | — | append method | append method | — |
| `MarkdownSourceStrategy.ts` | — | append method | append method + move logic | — |
| `api.ts` | — | getBookChapters (244-261) | createFlashcardNote (271-355) | — |
| `annotations.ts` | interface (3-18) | — | — | — |
| `paragraphs.ts` | interface (6-13) | — | — | — |

**Dependency graph:**
```
PR 1 (discriminated union)  ──→  PR 4 (fix updateAnnotation)
PR 2 (wire strategy)        ──→  PR 3 (mutation into strategy)
```

PR 1 ∥ PR 2: zero overlapping regions.
PR 3 ∥ PR 4: PR 3 touches strategy files + api.ts, PR 4 touches AnnotationsNote methods. No overlap.

**Decision:** PR 4 uses simple `if (section.type === 'paragraph')` check, NOT `strategy.renderSection()`. This avoids dependency on PR 2 and enables full parallelism. Refactor to strategy method in a follow-up if the pattern proves useful.

### Wave 1 (parallel)

| Track | Branch | PR | Scope |
|---|---|---|---|
| A | `refactor/discriminated-union` | PR 1 | Add `type` discriminator to section types |
| B | `refactor/strategy-navigation` | PR 2 | Wire strategy into AnnotationsNote, add `getNavigableSections` |

**Gate:** Both branches merge to main. `npm test` green on main after each merge.

### Wave 2 (parallel, after Wave 1 merges)

| Track | Branch | PR | Scope |
|---|---|---|---|
| C | `refactor/strategy-mutation` | PR 3 | Move deck-creation mutation into strategy |
| D | `fix/paragraph-rendering` | PR 4 | Fix `updateAnnotation` for paragraphs, remove `transform()` |

**Gate:** Both branches merge to main. Full verification (see below).

---

## PR Details

### PR 1: Discriminated union for sections (DEBT-001) ✅

**Branch:** `refactor/discriminated-union`

**Resolved:** `annotation.type` (MoonReader callout type) renamed to `calloutType` to free `type` for the discriminator.

**Files:**
- `src/data/models/paragraphs.ts` — add `type: 'paragraph'` to interface
- `src/data/models/annotations.ts` — rename `type` → `calloutType`, add `type: 'annotation'` literal
- `src/data/models/AnnotationsNote.ts` — add `type: 'heading'` to `Heading` class, rewrite type guards to use discriminator, clean up duck-typing in `findPreviousHeader*`
- `src/data/utils/annotationGenerator.ts` — `calloutType` rename + `type: 'annotation'`
- `src/api.ts` — replace `(chapter as any).level != undefined` with `chapter.type === 'heading'`
- Tests: updated fixtures with discriminator, snapshots updated

**Design note:** `type` is now first-class on `BookMetadataSection`. Consumers can narrow directly with `section.type === 'heading'` without importing guard functions — e.g., `sections.filter(s => s.type === 'heading')` gives `Heading[]` with full TS narrowing. Guard functions remain as convenience wrappers.

**Verify:** `npm test` — all 31 suites pass, no behavior change.

### PR 2: Wire strategy into AnnotationsNote + `getNavigableSections`

**Branch:** `refactor/strategy-navigation`

**Files:**
- `src/data/models/ISourceStrategy.ts` — add `getNavigableSections(sections: BookMetadataSections): Heading[]`
- `src/data/models/strategies/MoonReaderStrategy.ts` — implement: filter level-1 headings
- `src/data/models/strategies/MarkdownSourceStrategy.ts` — implement: return all headings
- `src/data/models/AnnotationsNote.ts` — add `strategy: ISourceStrategy` field, assign in `initialize()`
- `src/api.ts` — replace `getBookChapters()` conditional with `book.getNavigableSections()`
- `src/data/source-discovery.ts` — reuse existing `getSourceType()`

**Planned commits:**
1. `refactor(strategy): add getNavigableSections to ISourceStrategy [DEBT-013]`
2. `refactor(model): wire strategy into AnnotationsNote.initialize [DEBT-013]`
3. `refactor(api): delegate getBookChapters to strategy [DEBT-011]`

**Test criteria:**
- `npm test` — all pass
- Existing clippings navigation test (api.test.ts ~line 538) still passes
- `getBookChapters` no longer has `isDirectClipping` conditional
- New test: MoonReader source returns only level-1, markdown returns all headings

**Human review focus:** How is source type detected during `initialize()`? Is the strategy assignment correct for sources without flashcard notes yet?

### PR 3: Move deck-creation mutation into strategy

**Branch:** `refactor/strategy-mutation`
**Depends on:** PR 2 merged (strategy field exists on AnnotationsNote)

**Files:**
- `src/data/models/ISourceStrategy.ts` — add `requiresMutationConfirmation(): boolean`, `prepareForDeckCreation(path: string): Promise<string>`
- `src/data/models/strategies/MoonReaderStrategy.ts` — no-ops
- `src/data/models/strategies/MarkdownSourceStrategy.ts` — move `addBlockIdsToParagraphs()` and `ensureDirectMarkdownSourceInOwnFolder()` here
- `src/api.ts` — simplify `createFlashcardNoteForAnnotationsNote()`, delete free functions

**Planned commits:**
1. `refactor(strategy): add mutation methods to ISourceStrategy [DEBT-013]`
2. `refactor(api): delegate deck-creation mutation to strategy [DEBT-013]`

**Test criteria:**
- `npm test` — all pass
- `addBlockIdsToParagraphs` and `ensureDirectMarkdownSourceInOwnFolder` no longer exist in api.ts
- `requiresSourceMutationConfirmation` free function deleted
- Existing clippings deck creation test still passes

**Human review focus:** Does `prepareForDeckCreation` handle the path update correctly (AnnotationsNote.updatePath after folder move)? Is the block ID generation logic preserved exactly?

### PR 4: Fix `updateAnnotation` for paragraphs

**Branch:** `fix/paragraph-rendering`
**Depends on:** PR 1 merged (discriminator available)

**Files:**
- `src/data/models/AnnotationsNote.ts`:
  - `updateAnnotation()` — check `section.type`, render paragraph as plain text (not callout)
  - Remove `transform()` function
  - `getProcessedAnnotations()` — return `(annotation | paragraph)[]` union, stop calling `transform()`
  - `getAnnotation()` — return `annotation | paragraph`, stop calling `transform()`

**Planned commits:**
1. `fix(model): handle paragraph rendering in updateAnnotation [DEBT-001]`
2. `refactor(model): remove transform() paragraph-to-annotation masquerade [DEBT-001]`

**Test criteria:**
- `npm test` — all pass
- New test: `updateAnnotation` on a paragraph writes plain text + block ID, NOT callout format
- `transform()` function no longer exists
- UI components still work (they consume `highlight` field which paragraphs provide via the union)

**Human review focus:** What is the correct render format for a paragraph? Just `text ^blockId`? Do any UI components break when receiving `paragraph` instead of `annotation` from `getAnnotation()`?

---

## Execution Records

### PR 1: Discriminated union — Execution

**Agent:** Claude Code (Opus 4.6) — worktree `refactor-discriminated-union`
**Status:** Complete, pending merge

#### Files: Planned vs Actual

| Planned | Actual | Delta |
|---|---|---|
| `paragraphs.ts` | `paragraphs.ts` | as planned |
| `annotations.ts` | `annotations.ts` | + renamed `type` → `calloutType` (unplanned) |
| `AnnotationsNote.ts` | `AnnotationsNote.ts` | + rewrote `findPreviousHeader*` duck-typing |
| — | `annotationGenerator.ts` | not in plan — needed for `calloutType` rename |
| — | `api.ts` | not in plan — replaced `(chapter as any).level` with `chapter.type === 'heading'` |
| — | 6 test files + snapshots | fixture/snapshot updates for discriminator + rename |

#### Commits: Planned vs Actual

| Planned | Actual | Notes |
|---|---|---|
| 1. add discriminator to types | 1. single batch commit | should have been 3 incremental commits |
| 2. add narrowing tests | (folded into #1) | no dedicated test commit |
| — | 2. session notes commit | workflow observations |

#### Deviations

1. **`annotation.type` field conflict** — plan flagged this as human review focus ("Does the `annotation` interface's existing `type: string` field conflict with the discriminator?"). Agent resolved by renaming to `calloutType`. Good planning signal — the right question was asked, agent handled it autonomously.
2. **Scope expansion** — `annotationGenerator.ts` and `api.ts` not in plan but needed for the rename cascade and opportunistic cleanup.
3. **Single batch commit** — all changes committed at once instead of incremental green commits. Ideal sequence would have been: (1) rename `type` → `calloutType`, (2) add discriminator fields, (3) rewrite guards.

#### Agent Behavior

- Correctly identified and resolved the type field conflict without human intervention
- Batched all changes into one commit (recurring pattern — agents default to "get it working, commit once")
- Stayed within logical scope despite touching more files than planned
- Generated useful workflow improvement observations in session notes

---

### PR 2: Wire strategy + getNavigableSections — Execution

**Agent:** Codex
**Status:** Merged to main (`6199a86`)

#### Files: Planned vs Actual

| Planned | Actual | Delta |
|---|---|---|
| `ISourceStrategy.ts` | `ISourceStrategy.ts` | as planned |
| `MoonReaderStrategy.ts` | `MoonReaderStrategy.ts` | as planned |
| `MarkdownSourceStrategy.ts` | `MarkdownSourceStrategy.ts` | as planned |
| `AnnotationsNote.ts` | `AnnotationsNote.ts` | as planned |
| `api.ts` | `api.ts` | as planned |
| `source-discovery.ts` | `source-discovery.ts` | as planned |

#### Commits: Planned vs Actual

| Planned | Actual | Notes |
|---|---|---|
| 1. add getNavigableSections to strategy | 1. single commit covering all changes | 3 planned commits collapsed to 1 |
| 2. wire strategy into AnnotationsNote | (folded into #1) | |
| 3. delegate getBookChapters | (folded into #1) | |

#### Deviations

- Files matched plan exactly — no scope expansion needed
- Single commit instead of 3 incremental commits (same pattern as PR 1)
- No test additions (plan suggested new tests for source-type-specific navigation)

#### Agent Behavior

- Precise scope — touched exactly the planned files, nothing more
- Single commit pattern (consistent with PR 1 — this appears to be a default agent behavior across tools)
- Skipped new test creation despite plan specifying test criteria

---

### Wave 1 Retrospective

**Parallelism result:** PR 1 and PR 2 ran in parallel successfully. Rebase of PR 1 onto PR 2 produced one conflict (plan docs file only), zero code conflicts. File-region analysis was accurate.

**Recurring patterns:**
1. **Agents batch commits** — both agents (Claude Code, Codex) produced single commits instead of incremental sequences. This is a workflow gap, not a plan gap. Consider adding explicit "commit after each step" instructions to agent prompts.
2. **Plan-flagged risks get resolved** — the `annotation.type` conflict was predicted and handled. The parallelism prediction (no code conflicts) was correct.
3. **Scope expansion is minor** — PR 1 touched 2 extra files (cascade from rename). PR 2 matched exactly. Plans should budget for ~1-2 cascade files in rename-heavy PRs.

---

## Deferred

- Renaming `AnnotationsNote` → `SourceNote`, `bookSections` → `sections` (large rename, separate PR)
- Renaming routes `/books/chapters/` → `/sources/sections/` (cosmetic)
- `Source` shell class from ADR-018 (not needed until 3rd source type)
- `strategy.renderSection()` — revisit after PR 4 ships, if the type-check pattern proves insufficient

## Final Verification

After all 4 PRs merged:
1. `npm test` — full suite green
2. `grep -rn "hasMoonReaderFrontmatter\|isDirectClipping" src/api.ts` → 0 results
3. Manual: MoonReader deck → level-1 chapters → navigate → flashcards
4. Manual: Clippings deck → all headings → navigate → flashcards → block IDs injected
