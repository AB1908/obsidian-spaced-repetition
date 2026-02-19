# Plan: BUG-012 Card Creation Category Filter Regression

**Story:** [BUG-012](../stories/BUG-012-card-creation-category-filter-regression.md)
**Status:** Draft
**Branch:** `fix/card-creation-category-filtering`

## Scope
Restore meaningful category-based filtering for MoonReader card creation without regressing markdown strategy behavior.

## Test Contract (TDD First)
1. Add failing tests in `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`:
   - MoonReader card-creation route shows category controls.
   - MoonReader card-creation route does not show color filter controls.
   - MoonReader card-creation defaults to processed/category-oriented listing.
   - Direct-markdown card-creation behavior remains as currently intended.
   - Import flow behavior remains unchanged.
2. Run targeted test file and capture red phase.
3. Implement minimal code changes.
4. Re-run targeted test file to green.
5. Run full verification:
   - `npm test -- --runInBand`
   - `OBSIDIAN_PLUGIN_DIR=. npm run build`

## Implementation Notes
- Drive UI branching by source type rather than route-only assumptions.
- Keep filter-policy decisions centralized where possible to reduce further coupling.
- Avoid introducing source-specific conditionals across many UI components; prefer one seam.

## Drift Policy
Pause and re-plan if implementation requires broad API contract changes or route data-model reshaping beyond list-display behavior.
