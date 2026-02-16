# BUG-006 Session Notes

## Session: 2026-02-16

### Initial Scoping Feedback

**Issue:** First pass proposed adding a `getBasename()` function to `disk.ts` and doing a mechanical rename. This missed the deeper problem:

- The *choice* of parent name vs file name is domain logic, not infrastructure
- `api.ts:348` directly mutates `book.path` and `book.name` — a state transition that belongs in the domain model
- Adding `getBasename` to disk would just replace one infrastructure-layer domain decision with another

**Correction:** User directed a deeper refactor:
1. Move name derivation entirely into `AnnotationsNote` (the domain model)
2. No new disk.ts exports — reuse existing `getTFileForPath`
3. Encapsulate path+name updates in `updatePath()` method

**Lesson:** When a bug is caused by misplaced business logic, the fix should move the logic to the right layer — not just change which wrong-layer function gets called. Always evaluate separation of concerns before proposing a fix.

### Errors / Deviations

(To be updated during implementation)

### Observations

- The fixture mock system matches on `(method, JSON.stringify(input))` pairs, so multiple fixtures per method with different inputs work fine
- `getTFileForPath` has zero existing test fixtures — clean migration path
- `getParentOrFilename_constitution.json` had output `"Claude's Constitution"` which was the parent folder name — the actual manifestation of the bug in test data
