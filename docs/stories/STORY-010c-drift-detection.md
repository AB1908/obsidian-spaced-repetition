# STORY-010c: Content Drift Detection

## Status
Backlog

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## Depends on
- [STORY-010a](STORY-010a-content-fingerprinting.md) — fingerprints must exist first

## User Story
As a reader, I want to see which paragraphs have changed since I made flashcards, so that I can update or re-engage with drifted content.

## Acceptance Criteria
- [ ] `drifted` flag set on paragraphs where stored fingerprint != current text hash
- [ ] Drift detected during `AnnotationsNote.initialize()`
- [ ] Paragraphs without stored fingerprints are not flagged (backward compat)

## Tasks
- [ ] After `bookSections()` and flashcard linking, compare fingerprints
- [ ] Set `drifted: true` on mismatched paragraphs
- [ ] Integration tests in `api.test.ts`

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
