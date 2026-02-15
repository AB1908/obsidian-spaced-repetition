# STORY-010c: Content Drift Detection

## Status
Done

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## Depends on
- [STORY-010a](STORY-010a-content-fingerprinting.md) — fingerprints must exist first

## User Story
As a reader, I want to see which paragraphs have changed since I made flashcards, so that I can update or re-engage with drifted content.

## Acceptance Criteria
- [x] `drifted` flag set on paragraphs where stored fingerprint != current text hash
- [x] Drift detected during `AnnotationsNote.initialize()`
- [x] Paragraphs without stored fingerprints are not flagged (backward compat)

## Tasks
- [x] After `bookSections()` and flashcard linking, compare fingerprints
- [x] Set `drifted: true` on mismatched paragraphs
- [x] Integration tests in `api.test.ts` (deferred from this story; tracked in STORY-010 wrap-up)

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
