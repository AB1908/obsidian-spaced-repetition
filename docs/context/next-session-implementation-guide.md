# Next Session: Implementation Guide

**Quick reference for implementing navigation filter system and architecture improvements**

---

## 🎯 Recommended Implementation Order

### Session 1: Navigation Filter System (ADR-019) ⚡ HIGH PRIORITY

**Goal:** Fix Bug #1 - Navigation ignores UI filters

**Estimated Time:** 2-3 hours

**Tasks:**
1. ✅ Create `NavigationFilter` interface in `src/types/navigation.ts`
2. ✅ Update `getNextAnnotationId` signature to accept `filter?: NavigationFilter`
3. ✅ Update `getPreviousAnnotationId` signature to accept `filter?: NavigationFilter`
4. ✅ Implement filter logic inside navigation functions
5. ✅ Update components to pass filter state
6. ✅ Add comprehensive tests with filter parameter variations
7. ✅ Document in ADR-019

---

### Session 2: Remove API Indirection ⚡ QUICK WIN

**Goal:** Simplify architecture before adding filter parameter

**Estimated Time:** 30 minutes

**Tasks:**
1. ✅ Delete `src/ui/routes/books/api.ts`
2. ✅ Update imports in `annotation-with-outlet.tsx`
3. ✅ Update imports in `personal-note.tsx`
4. ✅ Update call sites (swap parameter order)
5. ✅ Update or consolidate `tests/routes_books_api.test.ts`
6. ✅ Run tests to verify no breakage

---

### Session 3: Flashcard Creation Route 🚀 NEW FEATURE

**Goal:** Separate flashcard creation with processed-only navigation

**Estimated Time:** 4-6 hours

**Tasks:**
1. ✅ Create route: `/books/:id/flashcards/create`
2. ✅ Build `FlashcardCreationPage` component
3. ✅ Build `ProcessedAnnotationNav` component
4. ✅ Add affordances (escape hatches, breadcrumbs)
5. ✅ Add context-specific keyboard shortcuts
6. ✅ Add tests for processed-only behavior
7. ✅ Add link from annotation list

---

## 📋 Implementation Checklists

### Checklist: Navigation Filter System

**1. Create NavigationFilter Interface**

```typescript
// src/types/navigation.ts (NEW FILE)
export interface NavigationFilter {
    /**
     * Include processed annotations (category !== null)
     * Default: true
     */
    includeProcessed?: boolean;

    /**
     * Include unprocessed annotations (category === null)
     * Default: true
     */
    includeUnprocessed?: boolean;

    /**
     * Filter to specific category ID
     * When set, only annotations with this category are included
     */
    categoryFilter?: number | null;

    /**
     * Filter to specific highlight color
     * Only applies to unprocessed annotations
     */
    colorFilter?: string | null;
}
```

**2. Update Navigation Function Signatures**

```typescript
// src/api.ts (lines 331-369)

// BEFORE
export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string
): string | null

// AFTER
export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
): string | null
```

**3. Implement Filter Logic**

```typescript
// Inside getNextAnnotationId loop (after line 364)
if (isAnnotationOrParagraph(item)) {
    const ann = item as annotation;

    // Skip deleted (existing logic)
    if (ann.deleted) continue;

    // NEW: Apply filter if provided
    if (filter) {
        const isProcessed = ann.category !== undefined && ann.category !== null;

        // Check processed/unprocessed filter
        if (filter.includeProcessed === false && isProcessed) continue;
        if (filter.includeUnprocessed === false && !isProcessed) continue;

        // Check category filter
        if (filter.categoryFilter !== undefined && filter.categoryFilter !== null) {
            if (ann.category !== filter.categoryFilter) continue;
        }

        // Check color filter (only for unprocessed)
        if (filter.colorFilter && !isProcessed) {
            if (ann.originalColor !== filter.colorFilter) continue;
        }
    }

    return ann.id;
}
```

**4. Update Components to Pass Filters**

```typescript
// src/ui/routes/books/book/annotation/AnnotationListPage.tsx
// Where filter state is managed (line 44):

const [mainFilter, setMainFilter] = useState<'all' | 'processed' | 'unprocessed'>('all');
const [categoryFilter, setCategoryFilter] = useState<number | null>(null);
const [colorFilter, setColorFilter] = useState<string | null>(null);

// Convert to NavigationFilter
const navigationFilter: NavigationFilter = {
    includeProcessed: mainFilter !== 'unprocessed',
    includeUnprocessed: mainFilter !== 'processed',
    categoryFilter: categoryFilter,
    colorFilter: colorFilter
};

// Store in sessionStorage for navigation components to access
useEffect(() => {
    sessionStorage.setItem('navigationFilter', JSON.stringify(navigationFilter));
}, [mainFilter, categoryFilter, colorFilter]);
```

**5. Update Navigation Components**

```typescript
// src/ui/routes/books/book/annotation/annotation-with-outlet.tsx (lines 32-33)

// Read filter from sessionStorage
const filterJson = sessionStorage.getItem('navigationFilter');
const filter = filterJson ? JSON.parse(filterJson) as NavigationFilter : undefined;

const previousAnnotationId = getPreviousAnnotationId(
    params.bookId,
    annotation.id,
    params.sectionId,
    filter // NEW parameter
);

const nextAnnotationId = getNextAnnotationId(
    params.bookId,
    annotation.id,
    params.sectionId,
    filter // NEW parameter
);
```

**6. Add Tests**

```typescript
// tests/api.test.ts - Add to existing describe block

test('skips unprocessed when includeUnprocessed=false', () => {
    // Assumes fixture with mixed processed/unprocessed
    const filter = { includeProcessed: true, includeUnprocessed: false };

    const nextId = getNextAnnotationId(bookId, firstAnnotationId, sectionId, filter);
    const nextAnnotation = getAnnotationById(nextId, bookId);

    // Next annotation should be processed
    expect(nextAnnotation.category).not.toBeNull();
    expect(nextAnnotation.category).not.toBeUndefined();
});

test('returns null at boundary of filtered list', () => {
    const filter = { includeProcessed: true, includeUnprocessed: false };

    // Get last processed annotation
    const allAnnotations = getAnnotationsForSection(sectionId, bookId).annotations;
    const processedAnnotations = allAnnotations.filter(a => a.category !== null);
    const lastProcessed = processedAnnotations[processedAnnotations.length - 1];

    const nextId = getNextAnnotationId(bookId, lastProcessed.id, sectionId, filter);

    expect(nextId).toBeNull();
});
```

**7. Create ADR-019**

```markdown
# ADR-019: Navigation Filter Contract

## Status
Implemented

## Context
[Copy from docs/bugs.md and navigation-architecture-analysis.md]

## Decision
Add NavigationFilter parameter to navigation functions.

## Consequences
[Positive and negative impacts]

## Implementation
[Reference this guide]
```

---

### Checklist: Remove API Indirection

**1. Delete File**
```bash
rm src/ui/routes/books/api.ts
```

**2. Update annotation-with-outlet.tsx**
```typescript
// Line 10-11: Change import
-import { getNextAnnotationIdForSection, getPreviousAnnotationIdForSection } from 'src/ui/routes/books/api';
+import { getNextAnnotationId, getPreviousAnnotationId } from 'src/api';

// Line 32-33: Update function calls (swap parameter order)
-const previousAnnotationId = getPreviousAnnotationIdForSection(params.bookId, params.sectionId, annotation.id);
-const nextAnnotationId = getNextAnnotationIdForSection(params.bookId, params.sectionId, annotation.id);
+const previousAnnotationId = getPreviousAnnotationId(params.bookId, annotation.id, params.sectionId);
+const nextAnnotationId = getNextAnnotationId(params.bookId, annotation.id, params.sectionId);
```

**3. Update personal-note.tsx** (similar changes)

**4. Update/Consolidate tests**
```typescript
// tests/routes_books_api.test.ts
// Option A: Update to test src/api directly
-import { getPreviousAnnotationIdForSection, getNextAnnotationIdForSection } from 'src/ui/routes/books/api';
+import { getPreviousAnnotationId, getNextAnnotationId } from 'src/api';

// Option B: Delete file, tests already exist in api.test.ts
```

**5. Verify**
```bash
npm test
```

---

### Checklist: Flashcard Creation Route

**1. Create Route**
```typescript
// src/routes/routes.tsx
{
    path: "flashcards",
    children: [
        {
            path: "create",
            element: <FlashcardCreationPage />,
            loader: flashcardCreationLoader
        },
        {
            path: "create/:annotationId",
            element: <CreateCardView />,
            loader: createCardLoader
        }
    ]
}
```

**2. Create FlashcardCreationPage Component**
```typescript
// src/ui/routes/books/flashcards/FlashcardCreationPage.tsx
export function FlashcardCreationPage() {
    const { bookId } = useParams();
    const book = useLoaderData<Book>();

    // Only processed annotations
    const processedAnnotations = book.annotations.filter(
        a => a.category !== undefined && a.category !== null
    );

    return (
        <div>
            <PageHeader>
                <Title>Create Flashcards</Title>
                <Subtitle>{processedAnnotations.length} processed annotations</Subtitle>
            </PageHeader>

            <AnnotationList annotations={processedAnnotations} />

            {processedAnnotations.length === 0 && (
                <EmptyState>
                    <Message>No processed annotations yet</Message>
                    <Link to={`/books/${bookId}/import/process`}>
                        Process annotations →
                    </Link>
                </EmptyState>
            )}

            <Footer>
                <Link to={`/books/${bookId}/annotations`}>
                    Browse all annotations
                </Link>
            </Footer>
        </div>
    );
}
```

**3. Create ProcessedAnnotationNav Component**
```typescript
// src/ui/routes/books/flashcards/components/ProcessedAnnotationNav.tsx
export function ProcessedAnnotationNav({ bookId, currentId, sectionId }) {
    // Hardcoded filter - always processed only
    const filter = {
        includeProcessed: true,
        includeUnprocessed: false
    };

    const prevId = getPreviousAnnotationId(bookId, currentId, sectionId, filter);
    const nextId = getNextAnnotationId(bookId, currentId, sectionId, filter);

    return (
        <>
            <NavigationButton
                direction="prev"
                disabled={!prevId}
                onClick={() => navigate(`/books/${bookId}/flashcards/create/${prevId}`)}
            />
            <NavigationButton
                direction="next"
                disabled={!nextId}
                onClick={() => navigate(`/books/${bookId}/flashcards/create/${nextId}`)}
            />
        </>
    );
}
```

**4. Add Tests**
```typescript
// tests/routes/flashcards/FlashcardCreationPage.test.tsx
describe('FlashcardCreationPage', () => {
    test('only shows processed annotations', () => {
        // Mock: book with mixed processed/unprocessed
        render(<FlashcardCreationPage />);

        const annotations = screen.getAllByRole('listitem');
        annotations.forEach(ann => {
            expect(ann).toHaveAttribute('data-category');
        });
    });

    test('shows empty state when no processed annotations', () => {
        // Mock: book with only unprocessed
        render(<FlashcardCreationPage />);

        expect(screen.getByText(/No processed annotations/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Process annotations/i })).toBeInTheDocument();
    });
});
```

---

## 🔍 Files to Read First

### Understanding Current State
1. `src/api.ts` lines 331-369 - Navigation functions
2. `src/ui/routes/books/api.ts` - Wrapper functions to remove
3. `src/utils/annotation-filters.ts` - Filter logic reference
4. `src/data/models/annotations.ts` - Annotation interface

### Understanding Context
1. `docs/bugs.md` - Bug #1 reproduction steps
2. `docs/context/navigation-architecture-analysis.md` - Full analysis
3. `docs/features/user_stories.md` - Priorities

### Test References
1. `tests/api.test.ts` - Existing navigation tests
2. `tests/routes_books_api.test.ts` - Wrapper function tests

---

## ⚠️ Common Pitfalls

### 1. Parameter Order Confusion
```typescript
// WRONG - sectionId before blockId
getNextAnnotationId(bookId, sectionId, blockId, filter)

// CORRECT - blockId before sectionId
getNextAnnotationId(bookId, blockId, sectionId, filter)
```

### 2. Filter Logic Edge Cases
- `includeProcessed: undefined` should default to `true`
- `category === 0` is a valid category (not unprocessed)
- `originalColor` only applies to unprocessed annotations

### 3. Session Storage Serialization
```typescript
// Store filter
sessionStorage.setItem('navigationFilter', JSON.stringify(filter));

// Retrieve filter
const filterJson = sessionStorage.getItem('navigationFilter');
const filter = filterJson ? JSON.parse(filterJson) as NavigationFilter : undefined;
```

### 4. Test Fixture Limitations
- Current fixture has only 2 annotations (both unprocessed)
- Cannot demonstrate "skip unprocessed" behavior
- May need to create mixed fixture or modify existing

---

## 📊 Success Criteria

### Navigation Filter System
- ✅ All existing tests still pass
- ✅ New tests pass for all filter combinations
- ✅ Bug #1 resolved (manual testing: apply filter, navigation respects it)
- ✅ No performance regression

### API Indirection Removal
- ✅ `src/ui/routes/books/api.ts` deleted
- ✅ All tests pass
- ✅ Components import from `src/api`

### Flashcard Creation Route
- ✅ Route accessible at `/books/:id/flashcards/create`
- ✅ Only processed annotations shown
- ✅ Navigation stays within processed annotations
- ✅ Escape hatches functional
- ✅ Tests pass

---

## 🐛 Debugging Tips

### Navigation not respecting filter
1. Check sessionStorage contains filter: `console.log(sessionStorage.getItem('navigationFilter'))`
2. Verify filter passed to API: Add logging in navigation functions
3. Check annotation has expected category: `console.log(annotation.category)`

### Tests failing after changes
1. Check if test mocks need updating (routes_books_api.test.ts)
2. Verify fixture has expected data structure
3. Check imports are correct after file deletion

### Component not rendering
1. Verify route is registered in routes.tsx
2. Check loader function returns expected data
3. Verify component imports are correct

---

## 📚 Additional Resources

- **React Router Docs:** https://reactrouter.com/en/main/start/tutorial
- **Testing Library:** https://testing-library.com/docs/react-testing-library/intro/
- **Obsidian Plugin API:** https://docs.obsidian.md/Reference/TypeScript+API

---

**Last Updated:** 2026-02-07
**Next Review:** After implementing navigation filter system
