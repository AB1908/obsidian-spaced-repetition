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

## Plan: 4 Sequential PRs

### PR 1: Discriminated union for sections (DEBT-001)

Add `type` discriminator to all section types for proper TypeScript narrowing.

**Files:**
- `src/data/models/paragraphs.ts` — add `type: 'paragraph'` to interface
- `src/data/models/annotations.ts` — add `type: 'annotation'` to interface, set in `parseAnnotations()`
- `src/data/models/AnnotationsNote.ts` — add `type: 'heading'` to `Heading` constructor, update type guards, update `bookSections()` function
- Tests: existing should pass unchanged; add discriminator-based narrowing tests

**Verify:** `npm test` — all pass, no behavior change.

### PR 2: Wire strategy into AnnotationsNote + `getNavigableSections`

**Files:**
- `src/data/models/ISourceStrategy.ts` — add `getNavigableSections(sections: BookMetadataSections): Heading[]`
- `src/data/models/strategies/MoonReaderStrategy.ts` — filter `type === 'heading' && level === 1`
- `src/data/models/strategies/MarkdownSourceStrategy.ts` — return all headings
- `src/data/models/AnnotationsNote.ts` — add `strategy: ISourceStrategy` field, assign in `initialize()`, add `getNavigableSections()` method
- `src/api.ts` — replace `getBookChapters()` conditional (~lines 244-261) with `book.getNavigableSections()`
- `src/data/source-discovery.ts` — reuse existing `getSourceType()`

**Verify:** `npm test`, existing clippings navigation test still passes.

### PR 3: Move deck-creation mutation into strategy

**Files:**
- `src/data/models/ISourceStrategy.ts` — add `requiresMutationConfirmation(): boolean` and `prepareForDeckCreation(path: string): Promise<string>`
- `src/data/models/strategies/MoonReaderStrategy.ts` — no-ops (`false`, identity)
- `src/data/models/strategies/MarkdownSourceStrategy.ts` — move `addBlockIdsToParagraphs()` and `ensureDirectMarkdownSourceInOwnFolder()` logic here
- `src/api.ts` — replace inline mutation in `createFlashcardNoteForAnnotationsNote()`, delete free functions

**Verify:** `npm test` + manual deck creation from clippings source.

### PR 4: Fix `updateAnnotation` for paragraphs

**Files:**
- `src/data/models/AnnotationsNote.ts` — `updateAnnotation()` checks `section.type`, renders paragraph as plain text (not callout)
- Consider adding `renderSection()` to `ISourceStrategy`
- Remove `transform()` function — paragraphs stop masquerading as annotations
- `getProcessedAnnotations()` / `getAnnotation()` return `annotation | paragraph` union

**Verify:** `npm test` + test paragraph metadata update writes correct markdown.

## Deferred

- Renaming `AnnotationsNote` → `SourceNote`, `bookSections` → `sections` (large rename, separate PR)
- Renaming routes `/books/chapters/` → `/sources/sections/` (cosmetic)
- `Source` shell class from ADR-018 (not needed until 3rd source type)

## Final Verification

After all 4 PRs:
1. `npm test` — full suite green
2. `grep -rn "hasMoonReaderFrontmatter\|isDirectClipping" src/api.ts` → 0 results
3. Manual: MoonReader deck → level-1 chapters → navigate → flashcards
4. Manual: Clippings deck → all headings → navigate → flashcards → block IDs injected
