# Plan: STORY-016 — Remove Filter Buttons from Flashcard Creation Flow

**Story:** [STORY-019](../stories/STORY-019-remove-filter-buttons-card-creation.md)
**Agent:** Codex 5.3
**Branch:** `feat/remove-card-creation-filters`

## Current State

`AnnotationDisplayList` (`src/ui/components/annotation-display-list.tsx:121-140`) renders three filter buttons (Unprocessed/Processed/All) in all contexts. `AnnotationListPage` (`src/ui/routes/books/book/annotation/AnnotationListPage.tsx:43-44`) sets default filter based on `isImportFlow`.

**Two route contexts use this component:**
1. **Import flow** (path includes `/import/`) — default `'unprocessed'` → keep buttons
2. **Flashcard creation flow** (all other paths) — default `'processed'` → remove buttons

## Approach

### `src/ui/routes/books/book/annotation/AnnotationListPage.tsx`

Pass new prop and change default:
```typescript
export function AnnotationListPage() {
    const chapterData = useLoaderData() as SectionAnnotations;
    const location = useLocation();

    const isImportFlow = location.pathname.includes("/import/");
    const [filter, setFilter] = React.useState<'unprocessed' | 'processed' | 'all'>(
        isImportFlow ? 'unprocessed' : 'all'  // CHANGED: 'processed' → 'all'
    );
    const [activeColorFilter, setActiveColorFilter] = React.useState<string | null>(null);

    return (
        <AnnotationDisplayList
            chapterData={chapterData}
            baseLinkPath={isImportFlow ? "personal-note" : "flashcards"}
            filter={filter}
            setFilter={setFilter}
            activeColorFilter={activeColorFilter}
            setActiveColorFilter={setActiveColorFilter}
            showFilterButtons={isImportFlow}  // NEW PROP
        />
    );
}
```

### `src/ui/components/annotation-display-list.tsx`

Add optional prop and conditionally render:
```typescript
interface AnnotationDisplayListProps {
    // ... existing props
    showFilterButtons?: boolean;  // NEW, default true
}

export function AnnotationDisplayList(props: AnnotationDisplayListProps) {
    const { showFilterButtons = true, /* ...rest */ } = props;

    return (
        <>
            <h3>{chapterData.title}</h3>

            {showFilterButtons && (
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    {/* existing Unprocessed/Processed/All buttons */}
                </div>
            )}

            {showFilterButtons && (
                <div style={{ marginBottom: '1rem' }}>
                    {/* existing CategoryFilter/ColorFilter sub-filters */}
                </div>
            )}

            <ul className={"sr-highlight-tree"}>
                {/* annotation list unchanged */}
            </ul>
        </>
    );
}
```

## Files to Modify

| File | Change |
|------|--------|
| `src/ui/components/annotation-display-list.tsx` | Add `showFilterButtons` prop, wrap buttons in conditional |
| `src/ui/routes/books/book/annotation/AnnotationListPage.tsx` | Pass `showFilterButtons={isImportFlow}`, change default to `'all'` |
| `tests/components/` | Update snapshots if any |

## Test Plan

- Existing snapshot tests may need updating (buttons removed from card creation render)
- Verify import flow still shows filter buttons
- Verify card creation flow shows all annotations without buttons
- Navigation filter (BUG-001) unaffected — that reads from sessionStorage, not these buttons

## Verification

```bash
npm test  # snapshots may need -u flag
npm run build
```
