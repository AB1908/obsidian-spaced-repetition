# Session: Navigation Testing & Architecture Planning

**Date:** 2026-02-07
**Branch:** `test/navigation-bugs`
**Status:** Planning complete, ready for implementation in next session

---

## What Was Accomplished

### ✅ User Stories Added (3 total)

1. **Flashcard Creation Separation** (NEW)
   - Dedicated route for flashcard creation with processed-only navigation
   - Context-specific UX and affordances
   - See: `docs/features/user_stories.md` (Medium priority, Large effort)

2. **API Indirection Removal** (Short-term)
   - Remove `src/ui/routes/books/api.ts` wrapper functions
   - Consolidate into `src/api.ts`
   - See: `docs/features/user_stories.md` (High priority, Low effort)

3. **Domain-Organized API Layer** (Roadmap)
   - Refactor monolithic `src/api.ts` into `src/apis/` domain modules
   - Maintain API layer separation while improving organization
   - See: `docs/features/user_stories.md` (Medium priority, Epic)

---

### ✅ Navigation Behavior Tests

**File:** `tests/api.test.ts`
**Added:** 5 inline snapshot tests documenting current navigation behavior

**Tests:**
1. Observe annotations available in test fixture
2. Forward navigation (first → second)
3. Backward navigation (last → previous)
4. Section boundary - no next after last
5. Section boundary - no previous before first

**Snapshots show:**
- 2 annotations (both `category: undefined`, `originalColor: undefined`)
- Navigation works correctly between them
- Boundaries return `null` as expected
- **Cannot demonstrate filter bug** with current fixture (both unprocessed)

**Location:** `tests/__snapshots__/api.test.ts.snap`

---

### ✅ Architecture Documentation

**File:** `docs/context/navigation-architecture-analysis.md`

**Contents:**
- Problem statement (navigation ignores filters, cross-cutting concerns)
- Context-specific navigation needs (annotation browsing, flashcard creation, import)
- Architectural options evaluated (3 options with pros/cons)
- Recommended solution: Route-based separation
- API layer design patterns (flexible vs opinionated)
- UX patterns (visual distinction, escape hatches, workflows, shortcuts)
- Migration strategy (4 phases)
- Testing strategy
- Performance considerations

---

### ✅ Git Commit

**Commit:** `06ad842`
**Message:** `docs,test: add navigation behavior tests and API refactor roadmap`

**Files committed:**
- `docs/features/user_stories.md` (+231 lines)
- `tests/api.test.ts` (+62 lines, -70 lines)
- `tests/__snapshots__/api.test.ts.snap` (new file)

---

## Key Architectural Insights

### The Core Problem

Different UI contexts need different navigation behaviors:

| Context | Scope | Filter Behavior | Example |
|---------|-------|----------------|---------|
| **Annotation Browsing** | All | User-configurable filters | Show all/processed/unprocessed, filter by category/color |
| **Flashcard Creation** | Processed only | Hardcoded to processed | Create cards from learning-ready content |
| **Import Processing** | Unprocessed only | Hardcoded to unprocessed | Categorize new imports |

**Current bug:** Single navigation implementation doesn't respect any filters.

---

### Recommended Solution: Route-Based Separation

**Why separate flashcard creation:**
1. **Focus:** Users creating flashcards shouldn't see unprocessed distractions
2. **Independent evolution:** Flashcard UX can evolve (bulk create, AI suggestions) without affecting annotation management
3. **Clearer contracts:** Different routes = different navigation scopes (no complex conditionals)
4. **Better testability:** Test each context independently

**Implementation approach:**
- Share primitive components (`<NavigationButton>`)
- Different orchestration per context (`<AnnotationNavigation>` vs `<ProcessedAnnotationNav>`)
- Separate routes: `/annotations` vs `/flashcards/create`

---

### API Layer Organization Philosophy

**Preserve API layer separation:**
- UI never imports from `data/models/*`
- API layer adapts models to UI needs
- Enables backend substitution (React Native, server API, etc.)

**Domain organization (future):**
```
src/apis/
├── sourcenote.ts    # Navigation, annotations (~150 lines)
├── flashcard.ts     # Flashcard CRUD (~100 lines)
├── review.ts        # Review sessions (~80 lines)
└── import.ts        # MoonReader imports (~60 lines)
```

**Benefits:**
- Discoverability (find navigation APIs in `apis/sourcenote.ts`)
- Testability (mock specific domains)
- Scalability (reduce merge conflicts)
- Backend substitution (swap domain modules)

---

## Next Steps (For Future Session)

### Priority 1: Fix Navigation Filter Bug (ADR-019)

**Tasks:**
1. Create `NavigationFilter` interface
2. Update `getNextAnnotationId` / `getPreviousAnnotationId` signatures to accept filter parameter
3. Implement filter logic (check category, color, deleted)
4. Update existing components to pass filter state
5. Add comprehensive tests with filter variations
6. Document in ADR-019

**Outcome:** Bug #1 resolved, navigation respects UI filters

---

### Priority 2: Remove API Indirection (Quick Win)

**Tasks:**
1. Delete `src/ui/routes/books/api.ts`
2. Update 2 component imports:
   - `annotation-with-outlet.tsx`
   - `personal-note.tsx`
3. Update parameter order at call sites
4. Update or consolidate `tests/routes_books_api.test.ts`

**Outcome:** Simpler architecture, easier to add filter parameter

---

### Priority 3: Implement Flashcard Creation Route (New Feature)

**Tasks:**
1. Create route: `/books/:id/flashcards/create`
2. Build `FlashcardCreationPage` component
3. Build `ProcessedAnnotationNav` component (hardcoded filter)
4. Add affordances (escape hatches, breadcrumbs)
5. Add tests for processed-only navigation

**Outcome:** Focused flashcard creation UX

---

## Test Coverage Status

### ✅ Already Tested

- `routes_books_api.test.ts` - Wrapper functions (basic navigation)
- `api.test.ts` - Navigation behavior snapshots (NEW)
- `annotation_with_outlet.test.tsx` - Component rendering

### ❌ Missing UI Test Coverage

Need to add to `annotation_with_outlet.test.tsx`:
1. Navigation button disabled states (when API returns `null`)
2. Navigation API called with correct parameters
3. Button click behavior (navigate to correct path)

**Blocked by:** Need to understand NavigationControl component structure first

---

## Important Files for Next Session

### Read First
- `docs/context/navigation-architecture-analysis.md` - Full architectural analysis
- `docs/bugs.md` - Bug #1 reproduction steps
- `docs/features/user_stories.md` - Roadmap priorities

### Implementation Files
- `src/api.ts` lines 331-369 - Navigation functions to update
- `src/ui/routes/books/api.ts` - Wrapper functions to remove
- `src/utils/annotation-filters.ts` - Filter logic reference
- `src/data/models/annotations.ts` - Annotation interface (category, originalColor fields)

### Test Files
- `tests/api.test.ts` - Navigation behavior tests (extend for filter variations)
- `tests/annotation_with_outlet.test.tsx` - UI tests to add
- `tests/routes_books_api.test.ts` - May need consolidation

---

## Questions to Revisit

1. **Fixture creation:** Do we need fixtures with mixed processed/unprocessed to demonstrate filter bug?
   - Current fixture: both annotations unprocessed
   - Cannot demonstrate "skips unprocessed" behavior

2. **UI test approach:** How to test NavigationControl component?
   - Need to understand component structure first
   - May need to read component source

3. **Migration timing:** When to implement flashcard creation separation?
   - After filter system working (dependency)
   - Or parallel development with feature flag?

---

## Context for Claude

**User's Intent:**
- Write failing tests first to capture bugs
- Document current behavior with snapshots
- Plan architecture improvements before implementing
- Commit incremental progress frequently

**User's Philosophy:**
- "Commits tell WHAT, docs tell WHY"
- Clean API layer separation (UI never imports models)
- Domain-driven organization within layers
- Test-driven development (write tests before fixes)

**Communication Style:**
- Principal engineer level analysis expected
- Concrete code examples preferred
- Evaluate tradeoffs explicitly
- Suggest improvements user might not have considered

---

## Useful Commands

```bash
# Run navigation tests
npm test -- api.test.ts --testNamePattern="Navigation"

# Update snapshots
npm test -- api.test.ts -u

# Run all tests
npm test

# Check git status
git status

# View commit
git show 06ad842
```
