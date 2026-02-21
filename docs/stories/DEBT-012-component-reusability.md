# DEBT-012: Component Reusability and Class Assignment Strategy

## Status
Ready

## Description
Several UI components reuse CSS classes and structural patterns in semantically incorrect ways:

- `BookCreator` (book-list.tsx) uses `sr-deck-counts` class to display tags — this class is meant for flashcard count badges
- The tree display in deck creation reuses the annotation list structure (`sr-deck-tree`, `tree-item-flair`) for a source selection list
- No shared generic tree/list component — each feature builds its own with copied class names

### Enhancement Note
`book-list.tsx:16` uses `window.confirm()` (OS native popup) for mutation confirmation. Should use Obsidian's modal API for consistent UX. Low priority since MVP works.

## Impact
- Visual bugs: tags displayed with flashcard-count styling
- Harder to build new features — no reusable primitives
- Class names carry semantic meaning that doesn't match usage

## Acceptance Criteria
- [ ] Identify shared tree/list patterns across routes
- [ ] Extract generic tree component with proper class assignment
- [ ] BookCreator uses appropriate classes for tag display
- [ ] Consider Obsidian modal for mutation confirmation

## Related
- [DEBT-011](../archive/stories/DEBT-011-book-metaphor-clippings.md) — domain model drives component design
