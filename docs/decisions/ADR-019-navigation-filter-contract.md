# ADR-019: Navigation Filter Contract and Backend/Frontend Drift Prevention

## Status
Accepted

## Context

### The Problem: Contract Drift Between Layers

During implementation of the modal breadcrumb feature, we discovered a critical architectural bug: **navigation logic and UI filtering operate on different assumptions about what constitutes "navigable" annotations.**

**Observed Behavior:**
- User applies "processed" filter in `AnnotationListPage` (shows only annotations with `category !== null`)
- User views the last visible (filtered) annotation and clicks "Next"
- Navigation attempts to jump to the next annotation in raw `bookSections` data
- This annotation is filtered out by the UI, so navigation appears broken or shows wrong state
- Title remains stuck on "Editing:" instead of returning to breadcrumb

**Root Cause:**
Business logic is split across layers without an explicit contract:
- **UI Layer** (`annotation-filters.ts`): Filters annotations by `category`, `color`, `deleted`
- **API Layer** (`api.ts:getNextAnnotationId`): Only checks `deleted`, ignores `category` and `color`
- **No Contract:** No interface or type enforcing consistency between layers

**Additional Problems:**
1. NavigationControl doesn't receive filter context from AnnotationListPage (state management gap)
2. "Processed" concept (`category !== null`) is implicit, scattered across multiple files
3. Tests mock infrastructure but don't verify cross-layer contracts
4. No documentation of expected behavior when navigating with filters active

### Why This Matters

This is a manifestation of **backend/frontend drift** - when business logic assumptions diverge between layers over time. Without prevention mechanisms, this pattern repeats:
- New filter added to UI → Navigation breaks silently
- Navigation logic changes → UI behavior changes unexpectedly
- Tests pass in isolation → Integration bugs slip through

## Decision

We will implement a **Navigation Filter Contract** that both UI and API layers must respect.

### Core Principles

1. **Explicit Contracts Over Implicit Assumptions**
   - Define `NavigationFilter` interface that codifies filtering rules
   - Both layers must use the same contract

2. **Business Logic Lives in Domain Models**
   - "Processed" concept moves to annotation model
   - UI and API delegate to model, don't reimplement logic

3. **Pass Context Through Call Chains**
   - Navigation methods accept optional `NavigationFilter` parameter
   - UI passes filter state to navigation (via Context, URL params, or sessionStorage)

4. **Test Cross-Layer Integration**
   - Integration tests verify full flow with filters applied
   - Tests use real business logic, mock only infrastructure

### Immediate Implementation

**Phase 1: Define Contract**
```typescript
// src/types/navigation-contracts.ts
export interface NavigationFilter {
    includeProcessed?: boolean;
    includeUnprocessed?: boolean;
    categoryFilter?: number | null;
    colorFilter?: string | null;
}
```

**Phase 2: Update API**
```typescript
// src/api.ts
export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
): string | null {
    // Apply filter.includeProcessed, filter.categoryFilter, etc.
}
```

**Phase 3: Pass Context from UI**
```typescript
// Use React Context or sessionStorage to share filter state
// between AnnotationListPage and AnnotationWithOutlet
const nextId = getNextAnnotationIdForSection(
    bookId,
    sectionId,
    annotationId,
    currentFilter // ✅ Now respects UI filter
);
```

**Phase 4: Add Integration Tests**
```typescript
// tests/api.test.ts
test('navigation skips unprocessed when filter applied', () => {
    const filter = { includeProcessed: true, includeUnprocessed: false };
    const nextId = getNextAnnotationId(bookId, currentId, sectionId, filter);
    // Verify nextId is a processed annotation
});
```

## Consequences

### Positive

- **Prevents Silent Bugs:** Type system enforces contract at compile time
- **Single Source of Truth:** Filter logic centralized in domain model
- **Better Testing:** Integration tests catch drift before production
- **Clear Intent:** `NavigationFilter` makes assumptions explicit
- **Future-Proof:** New filters require updating contract (forces consideration of impact)

### Negative

- **Refactoring Cost:** Must update all navigation call sites to accept filter parameter
- **State Management:** Need mechanism to pass filter from list page to detail page
- **Backward Compatibility:** Existing code assumes no filters (optional parameter mitigates this)

### Neutral

- **More Parameters:** Navigation methods now accept 4-5 parameters (could use query object pattern later)
- **Test Complexity:** Integration tests require more fixture setup

## Recommendations for Preventing Future Drift

### Short-Term (Weeks)

1. **Implement Navigation Filter Contract**
   - Add `NavigationFilter` interface
   - Update `getNextAnnotationId`/`getPreviousAnnotationId` signatures
   - Pass filter context from UI

2. **Add Integration Tests**
   - Test navigation with `includeProcessed` filter
   - Test navigation with `categoryFilter`
   - Test boundary conditions (last processed annotation in section)

3. **Document in Testing Guide**
   - Add section on "Testing Cross-Layer Contracts"
   - Explain when to use integration tests vs unit tests
   - Provide examples of contract drift scenarios

### Medium-Term (Months)

1. **Push Logic to Domain Model**
   - Create `annotation.isProcessed(): boolean` method
   - Create `annotation.isNavigable(filter): boolean` method
   - UI and API both delegate to this single implementation

2. **Improve State Management**
   - Use React Context to share filter state between list and detail views
   - Or: Store filter in URL params for linkability
   - Or: Use sessionStorage (already used for scroll position)

3. **Create Feature Documentation**
   - Move from `docs/context/` to `docs/features/navigation.md`
   - Document expected behavior with filters
   - Link to ADR-019

4. **Add More ADRs for Cross-Cutting Concerns**
   - ADR for state management strategy
   - ADR for filter architecture
   - ADR for backend/frontend communication contracts

### Long-Term (Quarters)

1. **Introduce NavigationService**
   ```typescript
   class NavigationService {
       constructor(private sourceNote: SourceNote, private filter: NavigationFilter) {}

       getNext(currentId: string): string | null {
           // Encapsulates both traversal and filtering
       }
   }
   ```
   - Single responsibility for navigation logic
   - Easier to test in isolation
   - Can add features (history, prefetching) without changing API

2. **Type-Safe Query Objects**
   ```typescript
   const query = AnnotationQuery
       .forProcessedOnly()
       .withCategory(3)
       .withColorFilter("rgba(...)");
   ```
   - Fluent API for complex filters
   - Better discoverability than many boolean parameters
   - Self-documenting

3. **Event-Driven Architecture**
   - Navigation emits events: `NavigationAttempted`, `NavigationCompleted`
   - UI validates against current filter state
   - Easier to add analytics, undo/redo, etc.

4. **Contract Testing Framework**
   - Consider Pact or similar for defining formal contracts
   - Automated validation that backend honors frontend expectations
   - Prevents drift at CI/CD level

## Alternatives Considered

### 1. Keep Current Behavior (Rejected)
Navigate through all annotations regardless of filter, let UI handle mismatch.

**Pros:** No code changes needed
**Cons:** Confusing UX, broken navigation, hard to debug

### 2. Filter Only in UI (Rejected)
Keep `getNextAnnotationId` unchanged, filter results in React component.

**Pros:** API stays simple
**Cons:** Inefficient, logic duplication, same drift risk

### 3. Always Pass All Context (Rejected)
Every API method accepts full UI state (filter, sort, pagination, etc.).

**Pros:** Complete information available
**Cons:** Tight coupling, bloated signatures, violates SRP

### 4. Separate Navigation APIs (Rejected)
Create `getNextProcessedAnnotation`, `getNextUnprocessedAnnotation`, etc.

**Pros:** Explicit method names
**Cons:** Combinatorial explosion (category × color × processed), not DRY

## Implementation Notes

### Testing Strategy

**Unit Tests** (for isolated logic):
- `annotation.isProcessed()` returns correct boolean
- `annotation.isNavigable(filter)` respects all filter parameters
- `getFilteredAnnotations()` matches same logic

**Integration Tests** (for cross-layer contracts):
- Navigation with filter skips non-matching annotations
- Navigation returns `null` at boundaries when filtered
- NavigationControl renders disabled state correctly

**UI Tests** (for full user flows):
- Apply filter → navigate → verify title updates
- Navigate to last filtered annotation → next button disabled
- Clear filter → navigation includes previously hidden items

### State Management Decision

We'll start with **sessionStorage** approach (matches existing scroll position pattern):
```typescript
// AnnotationListPage sets filter
sessionStorage.setItem('annotationFilter', JSON.stringify(filter));

// AnnotationWithOutlet reads filter
const savedFilter = sessionStorage.getItem('annotationFilter');
const filter = savedFilter ? JSON.parse(savedFilter) : {};
```

**Rationale:**
- Simple, no new dependencies
- Persists across navigation
- Already familiar pattern in codebase
- Can upgrade to Context/URL params later if needed

## References

- Issue: Navigation broken when using processed/unprocessed filters
- Related: docs/todo/technical_debt.md #5 (Fragile UI/Model State Interaction)
- Related: ADR-016 (Sidecar Annotation Architecture)
- Related: docs/testing_guide.md
- Related: docs/bugs.md (navigation section)

## Review Date

Review this decision after implementing Source Model Refactor (ADR-018), as the new architecture may provide better mechanisms for ensuring contract consistency.
