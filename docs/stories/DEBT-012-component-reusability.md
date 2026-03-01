# DEBT-012: Component Reusability and Class Assignment Strategy

## Status
Ready

## Description
Several UI components reuse CSS classes and structural patterns in semantically incorrect ways. These issues remain present in the current codebase.

### Class Misuse in BookCreator

`BookCreator` in `src/ui/components/book-list.tsx` renders the source selection list using `sr-deck-tree` and `tree-item-flair sr-deck-counts` for tag display:

```tsx
<ul className="sr-deck-tree">
  <li className="tree-item-self is-clickable" ...>
    <span className="tree-item-flair sr-deck-counts">
      {book.tags.length ? book.tags.join(", ") : "no-tags"}
    </span>
  </li>
</ul>
```

`sr-deck-counts` is semantically a flashcard count badge class. Using it for tag strings causes visual bugs and makes the CSS harder to reason about.

### No Shared Tree/List Component

`sr-deck-tree` / `tree-item-*` class structure is duplicated across multiple places without a shared generic component. Each feature builds its own variant with copied class names.

### Native Confirm Dialog

`book-list.tsx:16` uses `window.confirm()` (OS native popup) for mutation confirmation before adding block IDs to markdown sources. Should use Obsidian's modal API (`new Modal(app)`) for consistent UX. The code explicitly wraps `window.confirm()` in a try/catch to handle environments where it is not available (mobile), which is a workaround for the wrong abstraction.

## Impact
- Visual bugs: tags displayed with flashcard-count badge styling
- Harder to build new list/tree features — no reusable primitives
- Class names carry semantic meaning that does not match usage
- `window.confirm()` does not match Obsidian UX conventions and has platform-specific issues on mobile

## Acceptance Criteria
- [ ] Identify shared tree/list patterns across routes
- [ ] Extract generic tree component with proper class assignment
- [ ] `BookCreator` uses appropriate classes for tag display (not `sr-deck-counts`)
- [ ] Replace `window.confirm()` with Obsidian `Modal` for mutation confirmation

## Likely Touchpoints
- `src/ui/components/book-list.tsx` — `BookCreator` component, `window.confirm()`, class names
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx` — annotation list structure that may share patterns
- `src/ui/components/annotation-display-list.tsx` — shared annotation display patterns
- `src/ui/modals/CategoryEditorModal.ts` — example of existing Obsidian modal usage (reference pattern)

## Related
- [DEBT-011](../archive/stories/DEBT-011-book-metaphor-clippings.md) — domain model drives component design
