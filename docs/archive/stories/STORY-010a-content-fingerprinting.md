# STORY-010a: Content Fingerprinting for Paragraphs

## Status
Done

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## User Story
As a reader who edits source notes, I want the system to detect when a paragraph's text has changed since I created flashcards from it, so that I know when my flashcards may be stale.

## Acceptance Criteria
- [x] Fingerprint utility: deterministic hash from paragraph text
- [x] Paragraphs get `fingerprint` field at parse time
- [x] Fingerprint stored in flashcard metadata `<!--SR:id!flag,date,interval,ease!fp:hash-->`
- [x] Parser handles metadata with and without `!fp:` (backward compat)
- [x] Existing tests still pass

## Tasks
- [x] Create `src/data/utils/fingerprint.ts` with `generateFingerprint()`, `hasContentDrifted()`
- [x] Create `tests/data/utils/fingerprint.test.ts`
- [x] Add `fingerprint?`, `drifted?` to `paragraph` interface
- [x] Generate fingerprint in `bookSections()` paragraph branch
- [x] Extend `FlashcardMetadata` with `fingerprint?`
- [x] Update `SCHEDULING_REGEX` and `parseMetadata()` for `!fp:` segment
- [x] Update `metadataTextGenerator()` to serialize fingerprint
- [x] Pass fingerprint through card creation chain
- [x] Parser backward compatibility tests

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
- Blocks: [STORY-010c](STORY-010c-drift-detection.md)
