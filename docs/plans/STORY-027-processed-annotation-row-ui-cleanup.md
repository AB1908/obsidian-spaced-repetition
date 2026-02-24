# Plan: STORY-027 — Processed Annotation Row UI Cleanup

## Goal

Replace color swatches with category icons in processed annotation rows. As part of
this work, verify BUG-012 (category filter in card creation) and close it if already
confirmed green by existing tests.

---

## Design Decisions

### 1. Row component architecture: single component with context prop vs. separate components

**Options:**
- **A — Single component with `context` prop**: branch render inside `AnnotationListItem`
- **B — Separate components**: `ProcessedAnnotationRow` and `UnprocessedAnnotationRow`

**Chosen: B — separate components.**

Two distinct visual contracts (icon vs. swatch) with no shared inner logic. A context
prop would just be a boolean branch throughout. Separate components are easier to read,
test in isolation, and evolve independently. Matches the STORY-027 design note on
component decomposition.

---

### 2. Annotation flashcard count: context-dependent

The count field (`annotation.flashcardCount`) means different things in different views:

- **Processed / card-creation view**: shows how many cards already exist for the
  annotation — actively useful signal, placeholder for a future "coverage" metric.
  **Keep in `ProcessedAnnotationRow`.**
- **Import / annotation-processing view**: has no meaning — the user is focused on
  reading and categorizing, not on card counts. Adding it here creates noise.
  **Omit from `UnprocessedAnnotationRow`.**

No de-emphasizing needed: counts are simply present in one component and absent
in the other.

---

### 3. Uncategorized annotation placeholder

**Options:**
- **A — Empty / no indicator**: maximally clean
- **B — Neutral grey square**: keeps visual rhythm (same width as icon)
- **C — Generic "uncategorized" icon** (e.g. `circle-dashed`)

**Chosen: B — neutral grey square.**

Keeps column alignment consistent across rows. Avoids introducing a new icon concept
for an edge case. Can be replaced with a proper icon later without layout changes.

---

### 4. BUG-012 verification approach

Research indicates the filter policy (`sourceCapabilities.ts`) is already correct and
a test exists (`"MoonReader card creation is processed/category-focused"`). Codex must
run this test first and update BUG-012 to Done if it passes. If it fails, fix it in
this same commit.

---

## Implementation

### Modified files
- `src/ui/components/annotation-display-list.tsx` — rename `AnnotationListItem` →
  `UnprocessedAnnotationRow` (remove flashcard count from its render); import and
  conditionally render `ProcessedAnnotationRow` based on `effectiveFilter === 'processed'`

### New files
- `src/ui/components/ProcessedAnnotationRow.tsx` — category icon (16×16px via
  `setIcon`), neutral placeholder if uncategorized, de-emphasized annotation count

### Test files
- `tests/routes/books/book/annotation/AnnotationListPage.test.tsx` — verify
  BUG-012 test passes; add processed row rendering tests if not already covered
- New test file or additions covering `ProcessedAnnotationRow` directly if needed

### Changes to `annotation-display-list.tsx`

1. Rename `AnnotationListItem` → `UnprocessedAnnotationRow` (replace_all, keep same
   props and render logic)
2. Add import: `import { ProcessedAnnotationRow } from "./ProcessedAnnotationRow"`
3. In the `.map()` call inside `AnnotationDisplayList`, branch on
   `effectiveFilter === 'processed'`:

```typescript
{displayedAnnotations.map((annotation) =>
    effectiveFilter === 'processed' ? (
        <ProcessedAnnotationRow
            key={annotation.id}
            annotation={annotation}
            baseLinkPath={baseLinkPath}
            categories={categories}
        />
    ) : (
        <UnprocessedAnnotationRow
            key={annotation.id}
            annotation={annotation}
            baseLinkPath={baseLinkPath}
        />
    )
)}
```

`categories` should be threaded through from the loader (already available in
`AnnotationListPage` loader data) or read from settings — match the pattern used
by `CategoryFilter`.

### `ProcessedAnnotationRow.tsx` structure

```typescript
interface ProcessedAnnotationRowProps {
    annotation: annotation;
    baseLinkPath: string;
    categories: CategoryConfig[];
}

export function ProcessedAnnotationRow({ annotation, baseLinkPath, categories }) {
    const iconRef = useRef<HTMLDivElement>(null);
    const categoryConfig = categories.find(c => c.name === annotation.category) ?? null;

    useEffect(() => {
        if (iconRef.current && categoryConfig) {
            setIcon(iconRef.current, categoryConfig.icon);
        }
    }, [categoryConfig?.icon]);

    return (
        <div id={annotation.id}>
            <Link to={`${annotation.id}/${baseLinkPath}`} ...>
                <li className="sr-highlight tree-item-self is-clickable" style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {categoryConfig ? (
                        <div ref={iconRef} style={{ width: 16, height: 16, flexShrink: 0 }} />
                    ) : (
                        <div style={{ width: 16, height: 16, flexShrink: 0, backgroundColor: "var(--text-muted)", borderRadius: 2, opacity: 0.4 }} />
                    )}
                    <span className="sr-annotation-text" style={{ flexGrow: 1 }}>
                        {annotation.highlight}
                    </span>
                    {/* flashcard count: meaningful in card-creation context */}
                    {annotation.flashcardCount && (
                        <span className="tree-item-flair sr-test-counts">
                            {annotation.flashcardCount}
                        </span>
                    )}
                </li>
            </Link>
        </div>
    );
}
```

---

## Commit sequence

1. **`feat(annotation-list): show category icons in processed rows`**
   - `src/ui/components/annotation-display-list.tsx`
   - `src/ui/components/ProcessedAnnotationRow.tsx` (new)
   - `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`
   - BUG-012 verified green; story updated to Done in commit body

---

## Verification gates

- `npm test -- --testPathPattern="AnnotationListPage"` passes (includes BUG-012 test)
- `npm test -- --testPathPattern="annotation-display-list"` passes (if test file exists)
- `npm run build` exits 0
- Import flow (unprocessed rows) snapshot unchanged

## Delegation

```bash
scripts/delegate-codex-task.sh \
  --branch story-027-processed-annotation-row-ui-cleanup \
  --base main \
  --scope-file docs/plans/STORY-027-processed-annotation-row-ui-cleanup.md \
  --test-contract docs/plans/STORY-027-processed-annotation-row-ui-cleanup-test-contract.md \
  --log-file docs/executions/logs/story-027-processed-annotation-row-ui-cleanup.log \
  --semantic-log docs/executions/semantic/story-027-processed-annotation-row-ui-cleanup.md \
  --execute
```
