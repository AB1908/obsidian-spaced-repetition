# STORY-010a: Content Fingerprinting for Paragraphs

## Status
In Progress

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## User Story
As a reader who edits source notes, I want the system to detect when a paragraph's text has changed since I created flashcards from it, so that I know when my flashcards may be stale.

## Acceptance Criteria
- [x] Fingerprint utility: deterministic hash from paragraph text
- [ ] Paragraphs get `fingerprint` field at parse time
- [ ] Fingerprint stored in flashcard metadata `<!--SR:id!flag,date,interval,ease!fp:hash-->`
- [ ] Parser handles metadata with and without `!fp:` (backward compat)
- [ ] Existing tests still pass

## Tasks
- [x] Create `src/data/utils/fingerprint.ts` with `generateFingerprint()`, `hasContentDrifted()`
- [x] Create `tests/data/utils/fingerprint.test.ts`
- [ ] Add `fingerprint?`, `drifted?` to `paragraph` interface
- [ ] Generate fingerprint in `bookSections()` paragraph branch
- [ ] Extend `FlashcardMetadata` with `fingerprint?`
- [ ] Update `SCHEDULING_REGEX` and `parseMetadata()` for `!fp:` segment
- [ ] Update `metadataTextGenerator()` to serialize fingerprint
- [ ] Pass fingerprint through card creation chain
- [ ] Parser backward compatibility tests

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
- Blocks: [STORY-010c](STORY-010c-drift-detection.md)
