# STORY-011: Web Clipping Source Filter

## Status
Done

## Epic
None (standalone — may become part of a larger source management epic)

## Branch
TBD

## User Story
As a user, I want web clipping notes to be discoverable for deck creation without breaking existing `review/book` and `review/note` note workflows, so that direct markdown sources and MoonReader sources can coexist.

## Context
Current discovery in `AnnotationsNoteIndex.initialize()` includes notes by tag (`review/book`, `review/note`). We are adding clipping-awareness using Obsidian Web Clipper's `clippings` tag while preserving existing review-tag behavior.

The `clippings` tag is used to identify direct markdown clipping sources and to drive source-specific UX (including confirmation before source mutation for block IDs). It is not a replacement for existing review tags.

## Acceptance Criteria
- [x] Source discovery supports `clippings` tag as a recognized markdown source signal
- [x] Existing `review/book` and `review/note` discovery behavior remains unchanged
- [x] UI can surface raw tags for discovered candidates (no normalization required)
- [x] Source-specific behaviors can branch on source type/tag without strategy-layer coupling

## Session Notes
- 2026-02-15: Implemented eligibility policy via `src/data/source-discovery.ts` and updated `AnnotationsNoteIndex.initialize()` to consume it.

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
- [STORY-010b](STORY-010b-markdown-source-strategy.md)
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md)
- [DEBT-005](DEBT-005-source-discovery-policy-boundary.md)
