# Known Bugs

This document tracks confirmed bugs discovered during development and testing. Each bug includes reproduction steps, root cause analysis, and planned fix approach.

## Navigation Bugs

### 1. Navigation Ignores UI Filters (Backend/Frontend Contract Drift)

**Identified:** 2026-02-07
**Severity:** High
**Status:** Documented (ADR-019 created)

**Description:**
When viewing annotations with the "processed" or "unprocessed" filter applied in `AnnotationListPage`, the Previous/Next navigation buttons in `AnnotationWithOutlet` do not respect the active filter. Navigation attempts to jump to annotations that are filtered out of the UI, causing broken behavior.

**Reproduction Steps:**
1. Open a book with multiple annotations, some with `category` set (processed) and some without (unprocessed)
2. Navigate to the annotations list for a chapter
3. Apply "processed" filter (button at top of list)
4. Click on the last visible (processed) annotation
5. Click "Next" button in the annotation detail view
6. **Expected:** Button should be disabled (no more processed annotations)
7. **Actual:** Button attempts navigation, but nothing happens or wrong state is shown

**Root Cause:**
- **UI filtering** (`src/utils/annotation-filters.ts`): Filters by `category !== null` for "processed"
- **Navigation logic** (`src/api.ts:getNextAnnotationId`): Only checks `deleted`, ignores `category`
- No shared contract between layers - UI filter state is not passed to navigation methods

**Code Locations:**
- UI filter: `src/ui/routes/books/book/annotation/AnnotationListPage.tsx:44`
- Filter logic: `src/utils/annotation-filters.ts:3-21`
- Navigation: `src/api.ts:351-369` (`getNextAnnotationId`)
- Navigation caller: `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx:32-33`

**Planned Fix:**
- Create `NavigationFilter` interface (see ADR-019)
- Update `getNextAnnotationId`/`getPreviousAnnotationId` to accept optional filter parameter
- Pass filter context from `AnnotationListPage` to `AnnotationWithOutlet` via sessionStorage
- Add integration tests in `api.test.ts`

**Related:**
- ADR-019: Navigation Filter Contract
- Technical Debt #5: Fragile UI/Model State Interaction

---

### 2. Modal Title Doesn't Update When Navigating Between Annotations

**Identified:** 2026-02-07
**Severity:** Medium
**Status:** Needs investigation

**Description:**
When editing a flashcard and using the Previous/Next navigation buttons, the modal title remains stuck on "Editing: [question text]" instead of returning to the breadcrumb format ("Book Name / Chapter Name").

**Reproduction Steps:**
1. Navigate to an annotation with flashcards
2. Click "Edit" on a flashcard
3. Modal title shows "Editing: [question text]"
4. Click "Next" navigation button
5. **Expected:** Title updates to "Book Name / Chapter Name" (breadcrumb)
6. **Actual:** Title remains "Editing: [previous question text]"

**Root Cause Analysis:**
**Primary Issue:** Related to Bug #1 - navigation returns wrong annotation due to filter mismatch

**Secondary Issue:** `ModalTitleContext` may not be reacting to route changes properly:
- `setModalTitle` called in `useEffect` in `upsert-card.tsx` and `edit-card.tsx`
- Effect dependencies may not capture all state changes during navigation
- Route change via `navigate(pathGenerator(...), { replace: true })` might not trigger re-render

**Code Locations:**
- Title context: `src/ui/modals/ModalTitleContext.tsx:17-33`
- Edit card title: `src/ui/routes/books/card/edit-card.tsx:18-20`
- Upsert card title: `src/ui/routes/books/card/upsert-card.tsx:37-43`
- Navigation: `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx:35-39`

**Investigation Needed:**
1. Test if fixing Bug #1 (navigation filter) resolves this
2. Check if `flashcard` in `useLoaderData()` updates when route changes
3. Verify `useEffect` dependencies in edit-card.tsx and upsert-card.tsx
4. Test if `replace: true` in navigate affects loader execution

**Planned Fix:**
1. First fix Bug #1 to ensure navigation returns correct annotation
2. Add logging to `ModalTitleContext` to track state changes
3. Ensure loaders re-run when route changes
4. Add integration test: navigate between annotations while editing → verify title updates

**Related:**
- Bug #1: Navigation ignores UI filters
- Feature: Modal breadcrumb title (completed)

---

### 3. Navigation Beyond Section Boundaries

**Identified:** 2026-02-07
**Severity:** Medium
**Status:** Needs reproduction

**Description:**
When viewing the last annotation in a section, the "Next" button should be disabled (or hidden), but in some cases it remains clickable and attempts navigation.

**Expected Behavior:**
`getNextAnnotationId(bookId, blockId, sectionId)` should return `null` when:
- Current annotation is the last in the section (no more items in bookSections)
- Next item in bookSections is a Heading AND `sectionId` is provided (section boundary)

**Code Analysis:**
```typescript
// src/api.ts:351-369
export function getNextAnnotationId(bookId: string, blockId: string, sectionId?: string) {
    // ...
    for (let i = index + 1; i < book.bookSections.length; i++) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null; // ✅ Should stop at section boundary
            continue;
        }
        // ...
    }
    return null; // ✅ Should stop at end of bookSections
}
```

Logic appears correct. Need to verify:
1. Is `sectionId` being passed correctly from UI?
2. Are there edge cases with nested headings?
3. Does filter bug (#1) make this appear broken?

**Reproduction Needed:**
1. Create test case with clear section boundaries
2. Navigate to truly last annotation in section
3. Verify "Next" button state

**Code Locations:**
- Navigation logic: `src/api.ts:351-369`
- Button rendering: `src/ui/components/NavigationControl.tsx:29-31`
- Usage: `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx:52, 62`

**Investigation Needed:**
1. Add integration test for section boundary navigation
2. Add fixtures with clear section structure (heading → annotations → heading)
3. Log `sectionId` parameter to verify it's passed correctly

**Planned Fix:**
- Add test case first to confirm bug exists
- If confirmed, investigate heading detection logic
- Ensure `NavigationControl` receives correct `isDisabled` prop

---

## Testing Gaps

The bugs above highlight testing gaps that need to be addressed:

### Missing Integration Tests
- [ ] Navigation with filters applied (processed/unprocessed)
- [ ] Navigation with category filter active
- [ ] Navigation with color filter active
- [ ] Navigation at section boundaries
- [ ] Modal title updates during navigation
- [ ] NavigationControl disabled state at boundaries

### Missing UI Tests
- [ ] Full user flow: Apply filter → navigate → verify behavior
- [ ] Title state changes during flashcard editing
- [ ] Navigation button state (enabled/disabled) under various conditions

### Test File Locations
- Integration tests: `tests/api.test.ts` (add to existing describe blocks)
- Navigation-specific tests: `tests/navigation_bugs.test.tsx` (new file)
- UI tests: `tests/annotation_with_outlet.test.tsx` (extend existing)

## Related Documentation

- **ADR-019:** Navigation Filter Contract - Full analysis and long-term recommendations
- **Testing Guide:** `docs/testing_guide.md` - How to write integration tests
- **Technical Debt:** `docs/todo/technical_debt.md` #5 - Fragile UI/Model State Interaction
- **Architecture:** `docs/architecture/ui_layer.md` - React component structure
