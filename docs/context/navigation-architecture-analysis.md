# Navigation Architecture Analysis

**Created:** 2026-02-07
**Status:** Context documentation for future refactoring work
**Related:** Bug #1 (Navigation ignores UI filters), ADR-019, User Story (Flashcard creation separation)

## Overview

This document captures architectural analysis of the navigation system and the need for context-specific navigation behaviors. It serves as a reference for implementing the flashcard creation separation and navigation filter system.

---

## Problem Statement

### Current Architecture Issues

1. **Single navigation implementation serves multiple contexts** with different needs:
   - Annotation browsing (flexible filtering)
   - Flashcard creation (processed-only)
   - Import processing (unprocessed-only)

2. **Navigation ignores filter state** (Bug #1):
   - UI filters by category/color in `AnnotationDisplayList`
   - Navigation APIs (`getNextAnnotationId`) only check `deleted` flag
   - No mechanism to pass filter context to navigation

3. **Cross-cutting concerns:**
   - Navigation buttons appear in multiple routes
   - Each context needs different behavior
   - Conditional logic in shared components becomes complex

### Root Cause

**Missing contracts between layers:**
- UI layer has filter state (category, color, processed/unprocessed)
- Navigation layer has no access to this state
- No architectural pattern for context-specific behavior

---

## Context-Specific Navigation Needs

### 1. Annotation Browsing (`/books/:id/annotations`)

**Scope:** All annotations
**Filter Needs:** Flexible (category, color, processed/unprocessed)
**UX Goal:** Explore and manage all content

**Navigation Behavior:**
- Respect user-selected filters
- Allow toggling between all/processed/unprocessed
- Allow category-specific navigation
- Allow color-specific navigation (for unprocessed)

**Affordances:**
- Filter buttons (All / Processed / Unprocessed)
- Category filter dropdown
- Color filter pills

---

### 2. Flashcard Creation (`/books/:id/flashcards/create`) - NEW ROUTE

**Scope:** Processed annotations only
**Filter Needs:** Hardcoded to processed (category !== null)
**UX Goal:** Focus on learning-ready content, create flashcards efficiently

**Navigation Behavior:**
- ONLY navigate through processed annotations
- Skip unprocessed entirely (they shouldn't appear in list)
- Boundary: return null when no more processed annotations

**Affordances:**
- Header: "Create Flashcards" + processed count
- Empty state: "No processed annotations yet"
- Escape hatch: "Can't find annotation? → Browse all annotations"
- Quick actions: Bulk create, AI suggestions

**Why Separate:**
- Users creating flashcards don't want to be distracted by unprocessed content
- Unprocessed annotations aren't ready for learning (no categorization)
- Allows different UX evolution (bulk creation, AI, mobile gestures)
- Clearer API contract (no filter parameters needed - always processed)

---

### 3. Import/Processing (`/import/:id/process`)

**Scope:** Unprocessed annotations only
**Filter Needs:** Hardcoded to unprocessed (category === null)
**UX Goal:** Process new imports efficiently

**Navigation Behavior:**
- ONLY navigate through unprocessed annotations
- Skip already-processed
- Workflow: Process current → Navigate to next unprocessed

**Affordances:**
- Progress indicator (5 of 20 processed)
- Quick categorization buttons
- Batch processing controls

---

## Architectural Solutions Evaluated

### Option A: Context-Aware Navigation Component (Rejected)

```typescript
<NavigationProvider context="flashcard-creation">
    <AnnotationView />
    <NavigationControls /> {/* Adapts behavior via context */}
</NavigationProvider>
```

**Pros:**
- Reuses navigation UI
- Single component adapts to context

**Cons:**
- Complex conditional logic (`if (context === 'flashcard') ...`)
- Hard to reason about behavior
- Tight coupling between contexts
- Difficult to test independently

**Verdict:** ❌ Adds complexity without clear separation

---

### Option B: Unified Filter System with Presets (Partial Solution)

```typescript
const FILTER_PRESETS = {
    'all': { includeProcessed: true, includeUnprocessed: true },
    'processed-only': { includeProcessed: true, includeUnprocessed: false },
    'unprocessed-only': { includeProcessed: false, includeUnprocessed: true }
};

<Route path="flashcards/create" element={<FlashcardCreation preset="processed-only" />} />
```

**Pros:**
- Single navigation implementation
- Behavior configured via presets
- Easier to add new filter modes

**Cons:**
- Still cross-cutting (one component serves all contexts)
- Doesn't address context-specific affordances (escape hatches, shortcuts)
- Presets are just configuration - doesn't solve architectural coupling

**Verdict:** 🟡 Good for implementing filter parameter (ADR-019), but not sufficient for full separation

---

### Option C: Route-Based Separation (RECOMMENDED)

```
src/ui/routes/
├── books/book/annotation/          # Annotation management
│   ├── AnnotationListPage.tsx     # Flexible filtering
│   └── annotation-with-outlet.tsx # Full navigation
│
├── books/flashcards/               # Flashcard creation (NEW)
│   ├── FlashcardCreationPage.tsx  # Processed-only list
│   ├── CreateCardView.tsx         # Card creation UI
│   └── components/
│       └── ProcessedAnnotationNav.tsx  # Opinionated navigation
│
└── import/                         # Import/processing
    ├── ImportDashboard.tsx
    └── PersonalNotePage.tsx        # Unprocessed-only
```

**Pros:**
- Natural separation by route (URLs = contexts)
- Each route owns its UX and navigation behavior
- Independent evolution without breaking other contexts
- Clear user understanding (URL shows context)
- Can share primitive components with different orchestration
- Better testability (test each context independently)
- Clearer API contracts per context

**Cons:**
- Potential code duplication (mitigated by shared primitives)
- Maintenance burden (mitigated by clear boundaries)
- User might need education about different routes

**Verdict:** ✅ **Best balance of separation and maintainability**

---

## Recommended Architecture

### Shared Primitives (No Business Logic)

```typescript
// src/ui/components/primitives/NavigationButton.tsx
interface NavigationButtonProps {
    direction: 'prev' | 'next';
    disabled: boolean;
    onClick: () => void;
    label?: string;
}

export function NavigationButton({ direction, disabled, onClick, label }: NavigationButtonProps) {
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            aria-label={label || `Navigate ${direction}`}
        >
            <Icon name={direction === 'prev' ? 'arrow-left' : 'arrow-right'} />
        </button>
    );
}
```

### Context-Specific Orchestration

```typescript
// src/ui/routes/books/book/annotation/components/AnnotationNavigation.tsx
export function AnnotationNavigation({
    bookId,
    currentId,
    sectionId,
    filters // User-selected filters
}: AnnotationNavigationProps) {
    const prevId = getPreviousAnnotationId(bookId, currentId, sectionId, filters);
    const nextId = getNextAnnotationId(bookId, currentId, sectionId, filters);

    return (
        <>
            <NavigationButton
                direction="prev"
                disabled={!prevId}
                onClick={() => navigate(`/annotations/${prevId}`)}
            />
            <NavigationButton
                direction="next"
                disabled={!nextId}
                onClick={() => navigate(`/annotations/${nextId}`)}
            />
        </>
    );
}

// src/ui/routes/books/flashcards/components/ProcessedAnnotationNav.tsx
export function ProcessedAnnotationNav({
    bookId,
    currentId,
    sectionId
}: ProcessedAnnotationNavProps) {
    // Always filter to processed only - no user configuration needed
    const filter = { includeProcessed: true, includeUnprocessed: false };

    const prevId = getPreviousAnnotationId(bookId, currentId, sectionId, filter);
    const nextId = getNextAnnotationId(bookId, currentId, sectionId, filter);

    return (
        <>
            <NavigationButton
                direction="prev"
                disabled={!prevId}
                onClick={() => navigate(`/flashcards/create/${prevId}`)}
            />
            <NavigationButton
                direction="next"
                disabled={!nextId}
                onClick={() => navigate(`/flashcards/create/${nextId}`)}
            />
        </>
    );
}
```

---

## API Layer Design

### Option 1: Single API with Filter Parameter (Flexible)

```typescript
// src/api.ts or src/apis/sourcenote.ts
export interface NavigationFilter {
    includeProcessed?: boolean;
    includeUnprocessed?: boolean;
    categoryFilter?: number | null;
    colorFilter?: string | null;
}

export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
): string | null {
    const book = plugin.sourceNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);

    for (let i = index + 1; i < book.bookSections.length; i++) {
        const item = book.bookSections[i];

        // Check heading boundary
        if (isHeading(item) && sectionId) return null;

        if (isAnnotationOrParagraph(item)) {
            const ann = item as annotation;

            // Skip deleted
            if (ann.deleted) continue;

            // Apply filter (if provided)
            if (filter) {
                const isProcessed = ann.category !== undefined && ann.category !== null;

                if (filter.includeProcessed === false && isProcessed) continue;
                if (filter.includeUnprocessed === false && !isProcessed) continue;
                if (filter.categoryFilter && ann.category !== filter.categoryFilter) continue;
                if (filter.colorFilter && ann.originalColor !== filter.colorFilter) continue;
            }

            return ann.id;
        }
    }

    return null;
}
```

**Pros:**
- Single implementation
- Flexible for all contexts
- Easy to test with different filter combinations

**Cons:**
- More complex (needs to handle all filter cases)
- Slightly less performant (checks filter on each iteration)

---

### Option 2: Separate APIs per Context (Opinionated)

```typescript
// src/apis/sourcenote.ts - Generic (annotation browsing)
export function getNextAnnotation(bookId, blockId, sectionId, filter) { ... }

// src/apis/flashcard.ts - Opinionated (flashcard creation)
export function getNextProcessedAnnotation(bookId, blockId, sectionId) {
    return getNextAnnotation(bookId, blockId, sectionId, {
        includeProcessed: true,
        includeUnprocessed: false
    });
}

// src/apis/import.ts - Opinionated (import processing)
export function getNextUnprocessedAnnotation(bookId, blockId, sectionId) {
    return getNextAnnotation(bookId, blockId, sectionId, {
        includeProcessed: false,
        includeUnprocessed: true
    });
}
```

**Pros:**
- Clear intent (function name says what it does)
- Type-safe (no optional parameters in opinionated versions)
- Easy to optimize per context (e.g., pre-filter processed list)

**Cons:**
- More functions to maintain
- Duplication (though thin wrappers)

**Verdict:** 🟡 Good for ergonomics, but adds API surface

---

### Recommended: Hybrid Approach

Use **Option 1** (flexible API) for implementation, but provide **convenience wrappers** for common cases:

```typescript
// Core implementation (flexible)
export function getNextAnnotationId(bookId, blockId, sectionId, filter?) { ... }

// Convenience wrappers (ergonomics)
export function getNextProcessedAnnotationId(bookId, blockId, sectionId) {
    return getNextAnnotationId(bookId, blockId, sectionId, {
        includeProcessed: true,
        includeUnprocessed: false
    });
}
```

---

## UX Patterns for Context Separation

### 1. Visual Distinction

```tsx
// Flashcard creation page header
<PageHeader>
    <Icon name="cards" />
    <Title>Create Flashcards</Title>
    <Subtitle>Showing {processedCount} processed annotations</Subtitle>
    <Badge variant="info">Processed Only</Badge>
</PageHeader>

// vs Annotation browsing header
<PageHeader>
    <Icon name="list" />
    <Title>Annotations</Title>
    <FilterControls>
        <FilterButton active={filter === 'all'}>All</FilterButton>
        <FilterButton active={filter === 'processed'}>Processed</FilterButton>
        <FilterButton active={filter === 'unprocessed'}>Unprocessed</FilterButton>
    </FilterControls>
</PageHeader>
```

---

### 2. Escape Hatches

```tsx
// When user can't find annotation in flashcard creation
<EmptyState>
    <Message>Can't find the annotation you're looking for?</Message>
    <Message>It might not be processed yet.</Message>
    <ButtonGroup>
        <Button variant="secondary" onClick={() => navigate('/annotations?filter=all')}>
            Browse all annotations
        </Button>
        <Button variant="primary" onClick={() => navigate('/import/process')}>
            Process annotations
        </Button>
    </ButtonGroup>
</EmptyState>

// Or inline footer link
<FlashcardCreationPage>
    {/* Main content */}
    <Footer>
        <Link to="/annotations">Browse all annotations</Link>
        <Separator />
        <Link to="/import/process">Process unprocessed</Link>
    </Footer>
</FlashcardCreationPage>
```

---

### 3. Workflow Integration

```tsx
// After user processes an annotation
<ProcessingSuccess>
    <Message>Annotation categorized successfully!</Message>
    <ButtonGroup>
        <Button onClick={() => navigate('/import/process')}>
            Continue processing
        </Button>
        <Button variant="primary" onClick={() => navigate(`/flashcards/create/${annotationId}`)}>
            Create flashcard
        </Button>
    </ButtonGroup>
</ProcessingSuccess>
```

---

### 4. Context-Specific Keyboard Shortcuts

| Shortcut | Annotation Browsing | Flashcard Creation | Import Processing |
|----------|--------------------|--------------------|-------------------|
| `j` / `k` | Next/Prev (filtered) | Next/Prev processed | Next/Prev unprocessed |
| `Space` | Toggle filter menu | Quick-add basic card | Skip annotation |
| `c` | Categorize | Create custom card | Categorize current |
| `f` | Filter menu | n/a | Mark as processed |
| `Esc` | Close detail | Cancel creation | Back to dashboard |
| `?` | Help (context-aware) | Help (context-aware) | Help (context-aware) |

---

## Migration Strategy

### Phase 1: Implement Navigation Filter System (ADR-019) - PREREQUISITE
1. Add `NavigationFilter` interface to `src/types/`
2. Update `getNextAnnotationId` / `getPreviousAnnotationId` to accept `filter` parameter
3. Implement filter logic (check category, color, etc.)
4. Add comprehensive tests with filter variations
5. Update existing components to pass filters (annotation browsing)

**Outcome:** Navigation respects filters, Bug #1 resolved

---

### Phase 2: Create Flashcard Creation Route (Additive) - NEW FEATURE
1. Create route: `/books/:id/flashcards/create`
2. Build `FlashcardCreationPage` component
3. Build `ProcessedAnnotationNav` component (calls navigation API with hardcoded filter)
4. Add link from annotation list: "Create Flashcards →"
5. Add affordances: "Browse all" / "Process unprocessed" links
6. Add breadcrumbs: "Book > Flashcards > Create"

**Outcome:** Users can create flashcards with focused, processed-only view

---

### Phase 3: Refine UX (Iterative)
1. Context-specific keyboard shortcuts
2. Bulk card creation UI
3. AI-suggested cards
4. Mobile-optimized gestures
5. Performance optimization (pre-filter processed list)

---

### Phase 4: Evaluate & Optimize (Optional)
1. Gather user feedback on separate routes
2. A/B test if users prefer combined vs separate views
3. Optimize shared primitives based on usage
4. Consider deprecating old combined view if separate routes are preferred

---

## Testing Strategy

### Unit Tests: Navigation APIs

```typescript
// tests/api.test.ts or tests/apis/sourcenote.test.ts
describe('getNextAnnotationId with filters', () => {
    test('skips unprocessed when includeUnprocessed=false', () => {
        const filter = { includeProcessed: true, includeUnprocessed: false };
        const nextId = getNextAnnotationId(bookId, firstProcessedId, sectionId, filter);

        const nextAnnotation = getAnnotationById(nextId, bookId);
        expect(nextAnnotation.category).not.toBeNull();
    });

    test('skips processed when includeProcessed=false', () => {
        const filter = { includeProcessed: false, includeUnprocessed: true };
        const nextId = getNextAnnotationId(bookId, firstUnprocessedId, sectionId, filter);

        const nextAnnotation = getAnnotationById(nextId, bookId);
        expect(nextAnnotation.category).toBeNull();
    });

    test('returns null at boundary of filtered list', () => {
        const filter = { includeProcessed: true, includeUnprocessed: false };
        const nextId = getNextAnnotationId(bookId, lastProcessedId, sectionId, filter);

        expect(nextId).toBeNull();
    });
});
```

---

### Integration Tests: Context-Specific Navigation

```typescript
// tests/routes/flashcards/FlashcardCreationPage.test.tsx
describe('FlashcardCreationPage - Processed-only navigation', () => {
    test('only shows processed annotations in list', () => {
        render(<FlashcardCreationPage />);

        const annotations = screen.getAllByRole('listitem');
        annotations.forEach(ann => {
            expect(ann).toHaveAttribute('data-processed', 'true');
        });
    });

    test('navigation skips unprocessed annotations', () => {
        const { getByLabelText } = render(<FlashcardCreationPage />);

        // Mock: annotation sequence is [processed, unprocessed, processed]
        const nextButton = getByLabelText(/next/i);
        fireEvent.click(nextButton);

        // Should skip to second processed, not unprocessed
        expect(window.location.pathname).toContain('thirdProcessedId');
    });

    test('shows escape hatch when no processed annotations', () => {
        // Mock: no processed annotations
        render(<FlashcardCreationPage />);

        expect(screen.getByText(/Can't find annotation/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Browse all/i })).toBeInTheDocument();
    });
});
```

---

## Performance Considerations

### Current Approach (Linear Scan)
```typescript
// O(N) scan through bookSections on every navigation call
for (let i = index + 1; i < book.bookSections.length; i++) {
    if (matchesFilter(book.bookSections[i], filter)) {
        return book.bookSections[i].id;
    }
}
```

**Works fine for:**
- Small books (<100 annotations)
- Infrequent navigation

**Potential optimization for flashcard creation:**
```typescript
// Pre-filter processed annotations once when entering flashcard creation route
const processedAnnotations = book.bookSections.filter(
    item => isAnnotation(item) && item.category !== null
);

// Then navigation is O(1) lookup in pre-filtered list
const currentIndex = processedAnnotations.findIndex(a => a.id === currentId);
const nextAnnotation = processedAnnotations[currentIndex + 1];
```

**When to optimize:**
- Large books (>200 annotations)
- User reports sluggish navigation
- Performance profiling shows bottleneck

**Trade-off:**
- Pre-filtering = memory overhead (duplicate list)
- But O(1) navigation vs O(N) scan

---

## Open Questions

1. **State synchronization:** If user processes annotation while in flashcard creation view, should list auto-refresh?
   - **Recommendation:** Yes, subscribe to annotation updates and refresh list

2. **URL structure:** Should flashcard creation be nested under books or top-level?
   - **Option A:** `/books/:id/flashcards/create` (context of book)
   - **Option B:** `/flashcards/create?bookId=:id` (flashcard-centric)
   - **Recommendation:** Option A (maintains book context)

3. **Default route:** Should `/books/:id` redirect to annotations or flashcards?
   - **Recommendation:** Annotations (browsing is primary), link to flashcard creation

4. **Mobile differences:** Should mobile use modal flow instead of separate route?
   - **Recommendation:** Same route, different responsive layout

---

## Success Metrics

### For Navigation Filter System (ADR-019)
- ✅ All navigation tests pass with filter parameters
- ✅ Bug #1 resolved (navigation respects UI filters)
- ✅ No performance degradation

### For Flashcard Creation Separation
- ✅ Users can create flashcards without seeing unprocessed annotations
- ✅ Navigation in flashcard creation only moves through processed content
- ✅ Escape hatch usage tracked (indicates users finding value in separation)
- 📊 User feedback: "Flashcard creation feels more focused" (qualitative)

---

## References

- **Bug #1:** Navigation ignores UI filters (docs/bugs.md)
- **ADR-019:** Navigation Filter Contract (to be created)
- **User Story:** Flashcard creation separation (docs/features/user_stories.md)
- **Technical Debt #3:** Bloated api.ts (docs/todo/technical_debt.md)
- **Testing Guide:** docs/testing_guide.md

---

## Changelog

- **2026-02-07:** Initial analysis based on navigation bug discovery and architectural discussion
