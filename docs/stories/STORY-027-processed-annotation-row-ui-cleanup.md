# STORY-027: Processed Annotation List Row UI Cleanup

## Status
Done

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-025](STORY-025-category-editor-modal.md) (category icon set must be stable before embedding icons in rows)

## Description

In the processed annotation list (categorization/card-creation workflow), each row currently
shows a color swatch derived from the Moon Reader highlight color. In the processed context
this is noise — the user has already moved past the raw highlight; what matters now is the
semantic category, not the original color.

Additionally, each annotation row displays a sequential number. It is not clear these numbers
are load-bearing for the user's mental model or navigation; they may add visual clutter
without adding utility.

### Proposed direction

- **Remove color swatch** from processed-view annotation rows. Color is meaningful in the
  import/processing workflow but not in the card-creation or browsing context.
- **Show mini category icon** in its place, so the user can scan category distribution at a
  glance without entering each annotation.
- **Revisit annotation numbers**: determine whether they serve a user need (e.g. referencing
  a specific annotation in discussion, bookmark-like recall). If not, remove. If yes, consider
  making them secondary/de-emphasized.
- **Component decomposition**: the current shared row component has grown to serve multiple
  contexts. Evaluate splitting into context-aware variants rather than branching on props —
  separate processed-row and unprocessed-row components may be simpler to reason about than
  a single multi-branch component.

### Scope note

Color swatch removal is scoped to the **processed view only**. The import/processing view
may still benefit from color swatches as a processing signal (annotation origin).

## Acceptance Criteria
- [x] Processed annotation list rows do not render color swatches
- [x] Each processed row shows the annotation's category icon (if categorized), or a neutral
      placeholder icon if uncategorized
- [x] A product decision is documented on annotation numbers (keep/remove/de-emphasize)
- [x] Annotation number decision is implemented
- [x] No regression in import/processing view (color swatch remains there if still useful)
- [x] Tests cover processed vs. unprocessed row rendering differences

## Likely Touchpoints
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx`
- Annotation row component(s) (shared or split)
- `src/ui/components/` — any shared row/card component

## Related
- [STORY-017](STORY-017-card-creation-visibility-signals.md) — category badges/counts in card creation (complementary)
- [STORY-025](STORY-025-category-editor-modal.md) — icon set must be stable first
- [STORY-015](STORY-015-annotation-processing-workspace-ux.md) — broader workspace UX context
