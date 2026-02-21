# STORY-013: Add New Deck Source Chooser for Markdown

## Status
Done

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## Depends on
- [STORY-011](STORY-011-web-clipping-filter.md) - source tagging rules for clippings

## User Story
As a user, I want `Add new deck` to show a selectable list of source notes, so that I can create a flashcard deck from direct markdown sources and existing review-tagged notes.

## Context
The current `/books/create` flow is minimal and inconsistent with existing list/button patterns. We want to keep one entrypoint (`Add new deck`) and a single list for now (prototype phase), while preserving current behavior that excludes sources that already have flashcard files.

For direct clipping sources, selecting a source should prompt for confirmation before mutating the file:
"This will alter your file and add block IDs to all paragraphs."
On confirmation, IDs are injected in bulk for the selected file before flashcard deck creation.

## Acceptance Criteria
- [x] `Add new deck` entrypoint remains the primary way to create decks from source notes
- [x] `/books/create` renders a single selectable list using existing Obsidian-style list patterns
- [x] List items show raw source tags as metadata
- [x] Sources with existing flashcard files are excluded from this flow
- [x] Selecting a direct clipping source shows explicit confirmation before mutation
- [x] Confirmed mutation applies only to the selected file
- [x] For selected direct markdown source, plugin ensures folder layout: `original-filename/original-filename.md` + `Flashcards.md`

## Tasks
- [x] Refactor create-deck button to use the project's consistent button component/style
- [x] Replace `BookCreator` list with tree/list row pattern used elsewhere
- [x] Add source-tag display on each row
- [x] Add clipping-only mutation confirmation UX
- [x] Implement bulk paragraph block-ID injection for selected clipping source
- [x] Implement source move/organization into `original-filename/` folder when needed
- [x] Create `Flashcards.md` in the same folder

## Session Notes
- Keep this first pass simple; optimize discoverability/visual polish later based on usage.
- Future UX improvement: instead of hiding already-created sources, consider an "Open existing deck" affordance (out of scope here).
- Future configurability: support alternate file-organization styles via settings.
- 2026-02-15: Implemented the flow in `src/ui/components/book-list.tsx` and `src/api.ts`.

## Related
- [STORY-011](STORY-011-web-clipping-filter.md)
- [DEBT-005](DEBT-005-source-discovery-policy-boundary.md)
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
