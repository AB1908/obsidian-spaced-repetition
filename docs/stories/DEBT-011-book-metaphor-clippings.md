# DEBT-011: Book Metaphor Doesn't Fit Markdown/Clippings Sources

## Status
Ready

## Description
The entire route/API structure assumes the MoonReader book model: books contain chapters, chapters contain annotations. This was the original and only use case.

Clippings (direct markdown files tagged `clippings`) have a different structure: headings and paragraphs. The book metaphor doesn't map cleanly:

- Routes: `/books/:id/chapters/:sectionId/annotations` — clippings don't have "chapters" or "annotations"
- API: `getBookChapters()`, `getAnnotationsForSection()` — these names and contracts assume book structure
- Model: `AnnotationsNote` serves both MoonReader imports and direct markdown — overloaded
- After deck creation from a clipping, `bookSections` are stale (parsed pre-mutation) and may not represent the structure correctly
- The "add new flashcards" screen shows nothing after creating a deck from a clipping — likely because the chapter/annotation navigation doesn't match the clipping's content model

### Observed Symptom
After creating a deck from a clippings source (constitution.md), navigating to the book view shows no content in the chapters/annotations screens.

## Impact
- Clippings deck creation flow is broken end-to-end (deck creates but user can't add cards)
- Adding new source types will compound the problem
- Component reuse is hampered (see DEBT-012)

## Acceptance Criteria
- [ ] Investigate: write observation test in api.test.ts capturing post-deck-creation state for clippings
- [ ] Determine whether AnnotationsNote needs re-initialization after file mutation
- [ ] Design navigation model that works for both books and clippings
- [ ] Consider whether clippings need their own route/component tree

## Related
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md)
- [DEBT-012](DEBT-012-component-reusability.md) — component reuse tied to this
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md) — persistence patterns
