# Testing Guide

## Testing Philosophy: Infrastructure Mocking, Not Business Logic

This project follows a **layered testing approach** where we mock the **infrastructure layer** (disk operations, Obsidian API), not the business logic.

### What This Means

```
┌─────────────────────────────────────────┐
│    Business Logic (Real - NOT Mocked)   │
│  - api.ts methods                       │
│  - Model methods (SourceNote, etc.)    │
│  - Navigation, filtering, scheduling    │
│  ↓ operates on ↓                        │
├─────────────────────────────────────────┤
│    Plugin State (Created from Fixtures) │
│  - SourceNoteIndex                      │
│  - FlashcardIndex                       │
│  - Complete in-memory state             │
│  ↓ built using ↓                        │
├─────────────────────────────────────────┤
│    Infrastructure (Mocked via Fixtures) │
│  - disk.ts methods                      │
│  - Obsidian API (app.vault, etc.)      │
│  - File system operations               │
└─────────────────────────────────────────┘
```

**Key Principle:** Fixtures don't just provide return values - they create a **complete, deterministic world state**. Then the **real** business logic methods operate on this state.

**Example:**
```typescript
// ✅ Good - Test real navigation logic
test('getNextAnnotationId skips deleted annotations', () => {
    // Fixtures create plugin state with deleted annotations
    const nextId = getNextAnnotationId(bookId, currentId, sectionId); // Real method!
    expect(nextId).not.toBe(deletedAnnotationId);
});

// ❌ Bad - Don't mock business logic
test('getNextAnnotationId skips deleted annotations', () => {
    jest.spyOn(api, 'getNextAnnotationId').mockReturnValue('next-id'); // Wrong!
});
```

### What to Mock vs. What to Test

| Layer | Mock or Real? | Why |
|-------|---------------|-----|
| `disk.ts` methods | **Mock** (via fixtures) | External dependency, slow, non-deterministic |
| Obsidian API | **Mock** | Not available in test environment |
| `api.ts` methods | **Real** | Core business logic we're testing |
| Model methods | **Real** | Domain logic we're testing |
| React components | **Real** (with mocked hooks) | UI behavior we're testing |

## Mocks and Fixtures

The project uses a fixture-based mocking strategy for disk operations (`src/data/disk.ts`).

### `createDiskMockFromFixtures`
Located in `tests/helpers.ts`, this utility creates a mock object where functions are generated dynamically based on provided JSON fixture files.

**Important:** A function is ONLY mocked if at least one fixture file defines it via the `method` property.

### Adding a New Mocked Method
To mock a new method (e.g., `someNewDiskOp`):

1.  **Create a Fixture File:** Create a JSON file in `tests/fixtures/` (e.g., `someNewDiskOp.json`).
2.  **Define Method:** Set `"method": "someNewDiskOp"`.
3.  **Define Input/Output:**
    *   `input`: Array of arguments expected. For `deleteCardOnDisk(path, text)`, this should be a 2-element array.
    *   `output`: Return value.
    *   *Note:* If exact input matching is not required (e.g., for void functions where we just want the mock to exist and return `undefined`), you can provide placeholder inputs with the correct structure/arity. The mock will fallback to returning `Promise.resolve(undefined)` if the actual call doesn't match the fixture input, but the function *will* exist.
4.  **Register Fixture:** Add the filename to the `createDiskMockFromFixtures` call in your test file (e.g., `tests/api.test.ts`).

### Example: `deleteCardOnDisk`
To ensure `deleteCardOnDisk` is mocked:
1.  Create `tests/fixtures/deleteCardOnDisk.json`:
    ```json
    {
        "method": "deleteCardOnDisk",
        "input": ["path/to/file.md", "card text content"],
        "output": null
    }
    ```
    (Note: `output` is null because the function returns `Promise<void>`)
2.  Add `"deleteCardOnDisk.json"` to the fixture list in `tests/api.test.ts`.

## Common Testing Patterns & Issues

### Global Test Setup (`newFunction`)
Most tests in `api.test.ts` use a `newFunction()` helper inside `beforeEach`. This function creates a complete, in-memory instance of the plugin and its indices based on the fixtures. Be aware that this creates a "fully populated" state, which can make testing initial creation logic (e.g., `createFlashcardOnDisk`) tricky, as the entity may already exist. In such cases, the correct approach is to test the function's error-handling guard clause.

### Handling Test Flakiness (`Math.random`)
The review deck generation logic involves shuffling cards using `Math.random()`. This can cause tests that rely on card order (e.g., `getCurrentCard`) to be flaky.

**Solution:** To ensure deterministic tests, spy on and mock `Math.random()` within the `describe` block for the test suite.
```typescript
describe("MyFlakyTest", () => {
    let randomSpy: any;

    beforeEach(async () => {
        randomSpy = jest.spyOn(Math, "random").mockReturnValue(0.5); // Use a constant seed
        await newFunction();
    });

    afterEach(() => {
        randomSpy.mockRestore();
    });

    test("...", () => { /* ... */ });
});
```

## Testing Cross-Layer Contracts

### The Problem: Contract Drift

Backend and frontend can diverge when business logic assumptions are split across layers without an explicit contract. Example:

**UI Layer** filters annotations by `category !== null` (processed)
**API Layer** navigation doesn't check `category` at all
**Result:** Navigation broken when filters applied

### Integration Tests Prevent Drift

**Unit tests** verify isolated behavior. **Integration tests** verify cross-layer contracts.

#### Example: Navigation Respects UI Filters

```typescript
// tests/api.test.ts
describe("getNextAnnotationId with filters", () => {
    beforeEach(async () => {
        await newFunction(); // Creates plugin state from fixtures
    });

    test("should skip unprocessed annotations when filter applied", () => {
        const bookId = "t0000010";
        const sectionId = "t0000011";

        // Setup: Get all annotations in section
        const allAnnotations = getAnnotationsForSection(sectionId, bookId);
        expect(allAnnotations.annotations.length).toBeGreaterThan(2);

        // Find a processed annotation (has category set)
        const processedAnnotations = allAnnotations.annotations.filter(
            ann => ann.category !== undefined && ann.category !== null
        );
        expect(processedAnnotations.length).toBeGreaterThan(0);

        const firstProcessed = processedAnnotations[0];

        // Test: Navigation with filter should skip unprocessed
        const filter = { includeProcessed: true, includeUnprocessed: false };
        const nextId = getNextAnnotationId(bookId, firstProcessed.id, sectionId, filter);

        // Verify: Next annotation is also processed
        if (nextId) {
            const nextAnnotation = getAnnotationById(nextId, bookId);
            expect(nextAnnotation.category).not.toBeUndefined();
            expect(nextAnnotation.category).not.toBeNull();
        }
    });

    test("should return null at section boundary with filter", () => {
        // Setup: Last processed annotation in section
        const bookId = "t0000010";
        const sectionId = "t0000011";
        const allAnnotations = getAnnotationsForSection(sectionId, bookId);

        const processedAnnotations = allAnnotations.annotations.filter(
            ann => ann.category !== undefined && ann.category !== null
        );
        const lastProcessed = processedAnnotations[processedAnnotations.length - 1];

        // Test: Navigation should return null (no more processed annotations)
        const filter = { includeProcessed: true, includeUnprocessed: false };
        const nextId = getNextAnnotationId(bookId, lastProcessed.id, sectionId, filter);

        expect(nextId).toBeNull();
    });
});
```

#### Key Principles for Integration Tests

1. **Use Real Business Logic:** Call actual `api.ts` methods, don't mock them
2. **Test the Contract:** Verify both layers agree on what's "valid"
3. **Test Boundaries:** Empty results, last item, edge cases
4. **Test State Changes:** Verify state transitions across layers
5. **Use Fixtures for Setup:** Create deterministic plugin state, not mocked return values

### When to Write Integration Tests

Write integration tests when:
- [ ] Business logic spans multiple layers (UI → API → Model)
- [ ] Implicit contracts exist (e.g., what "navigable" means)
- [ ] Filtering/transformation happens in multiple places
- [ ] User-visible behavior depends on state in different layers
- [ ] Refactoring might break assumptions between layers

### Integration Test Checklist

For any feature that crosses layers:

```typescript
describe("Feature: Navigation with Filters", () => {
    // ✅ Test the happy path
    test("navigates to next filtered item");

    // ✅ Test boundary conditions
    test("returns null at end of filtered list");
    test("returns null at section boundary with filter");

    // ✅ Test edge cases
    test("handles empty filter results");
    test("handles all items filtered out");

    // ✅ Test state consistency
    test("filtered navigation matches UI display");
    test("navigation respects multiple filters simultaneously");
});
```

### Preventing Contract Drift: Best Practices

1. **Define Explicit Contracts**
   ```typescript
   // src/types/contracts.ts
   export interface NavigationFilter {
       includeProcessed?: boolean;
       categoryFilter?: number | null;
   }
   ```

2. **Document Contracts in ADRs**
   - See ADR-019: Navigation Filter Contract
   - Capture assumptions, decisions, alternatives

3. **Test Contracts, Not Implementations**
   ```typescript
   // ✅ Good - Tests contract
   test("navigation respects category filter", () => {
       const result = getNextAnnotationId(id, filter);
       // Verify result matches filter criteria
   });

   // ❌ Bad - Tests implementation detail
   test("navigation calls findIndex", () => {
       const spy = jest.spyOn(Array.prototype, 'findIndex');
       getNextAnnotationId(id);
       expect(spy).toHaveBeenCalled();
   });
   ```

4. **Keep Business Logic in One Place**
   - Define `isProcessed()` in annotation model
   - UI and API both use same method
   - Test the model method once, rely on it everywhere

5. **Use TypeScript to Enforce Contracts**
   ```typescript
   // If navigation requires filter, make it non-optional
   function getNextAnnotationId(
       bookId: string,
       currentId: string,
       filter: NavigationFilter // Required!
   ): string | null
   ```
