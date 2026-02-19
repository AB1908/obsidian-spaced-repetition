# Delegation Scope: BUG-012 Card Creation Category Filtering

**Story:** `docs/stories/BUG-012-card-creation-category-filter-regression.md`
**Primary plan:** `docs/plans/BUG-012-card-creation-category-filter-plan.md`
**Target branch:** `fix/card-creation-category-filtering`

## Plan Scope

Implement source-type-aware card-creation filtering behavior:
- MoonReader card-creation: category-oriented controls and processed-focused listing.
- Direct-markdown card-creation: preserve existing markdown behavior.
- Import flow: unchanged.

## Test Plan (TDD)

Add failing tests first in `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`:
1. MoonReader card-creation route exposes category controls.
2. MoonReader card-creation route hides color controls.
3. MoonReader card-creation route uses processed/category-oriented listing.
4. Direct-markdown card-creation route preserves existing behavior.
5. Import route behavior is unchanged.

Then implement minimal scoped changes and re-run tests.

## Execution Plan

1. Create/attach worktree on `fix/card-creation-category-filtering` from `main`.
2. Add tests and confirm red phase.
3. Implement minimal code changes in route/component seam.
4. Re-run targeted tests to green.
5. Run full verification and build.
6. Update story status/checkboxes if fully met.
7. Commit with BUG-012 reference and return concise summary.

## Verification Commands

```bash
npm test -- --runInBand tests/routes/books/book/annotation/AnnotationListPage.test.tsx
npm test -- --runInBand
OBSIDIAN_PLUGIN_DIR=. npm run build
```

## Safety Constraints

- No destructive git operations.
- Keep scope limited to BUG-012 behavior.
- Do not push.
