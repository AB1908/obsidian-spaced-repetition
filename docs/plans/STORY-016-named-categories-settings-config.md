# Plan: STORY-016 — Named Categories with Settings Config

**Story:** `docs/stories/STORY-016-customizable-annotation-categories.md`  
**Status:** Draft for execution

## Goal
Replace hardcoded numeric categories (`0..5`) with settings-driven named categories (`string`) and keep filtering/editor behavior consistent across import and card-creation flows.

## Scope Boundaries

### In Scope
- Category domain type and defaults in settings.
- Metadata serialization/deserialization for string category names.
- Import editor category selection using configured categories.
- Category filter UI and filtering predicates using string categories.
- Tests covering new behavior and backward-compat for old numeric metadata values.

### Out of Scope (for this story)
- Category rename migration utility (tracked by STORY-021).
- Icon picker UI beyond default icon for new categories.
- Broader card-creation visibility redesign (tracked by STORY-017).

## Planned Touchpoints
- `src/config/annotation-categories.ts`
- `src/settings.ts`
- `src/data/models/annotations.ts`
- `src/data/utils/metadataSerializer.ts`
- `src/ui/routes/import/personal-note.tsx`
- `src/ui/routes/import/useAnnotationEditor.ts`
- `src/ui/components/category-filter.tsx`
- `src/utils/annotation-filters.ts`
- `tests/routes/import/PersonalNotePage.test.tsx`
- `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`
- `tests/api.test.ts`
- `tests/models/annotations.test.ts`
- `tests/annotations.test.ts`
- `tests/metadataSerializer.test.ts`

## Incremental Execution Strategy

### Phase A: Domain + Serialization
1. Introduce `CategoryConfig` and default categories (`name`, `icon`) in settings/config.
2. Change annotation category type from `number` to `string` at domain edges.
3. Update metadata serializer/parser:
- write `category: <name>`
- parse strings
- treat numeric legacy values as uncategorized (`undefined`) for compatibility

### Phase B: UI + Filter Integration
1. Render import category buttons from settings instead of hardcoded array.
2. Add "add category" affordance with validated category name creation.
3. Update editor hook and filter components/types to use `string | null`.
4. Update `annotation-filters.ts` to compare category names (string equality).

### Phase C: Test and Regression Hardening
1. Update existing tests for string categories.
2. Add regression tests for:
- legacy numeric metadata deserialization fallback
- settings-driven category rendering
- category filter behavior with string categories
3. Re-run full suite and update snapshots only where behavior intentionally changed.

## Proposed Commit Topology
1. `test(story-016): add string-category contracts and legacy fallback coverage`  
2. `refactor(domain): switch category model and metadata serialization to string names`  
3. `feat(ui): drive category controls from settings and support category creation`  
4. `test(story-016): update snapshots and integration assertions for settings categories`  
5. `docs(story-016): update story checklist and execution notes`

## Parallelization Plan (Worktrees)
- Lane 1 (Domain): Phase A core typing + serializer changes.
- Lane 2 (UI): Phase B component/hook/settings plumbing.
- Lane 3 (Tests): Phase C assertions/snapshots based on merged behavior.

Note:
- Lane 2 depends partially on Lane 1 types; run Lane 1 first or rebase Lane 2 after Lane 1 merge.
- Lane 3 should run after Lane 1+2 to avoid churn.

## Verification Gates
1. `scripts/story-catalog.sh check`
2. `scripts/lint-docs.sh`
3. Targeted test pass:
- `npm test -- --runInBand tests/metadataSerializer.test.ts`
- `npm test -- --runInBand tests/routes/import/PersonalNotePage.test.tsx`
- `npm test -- --runInBand tests/routes/books/book/annotation/AnnotationListPage.test.tsx`
4. Full test suite:
- `npm test -- --runInBand`
5. Build:
- `OBSIDIAN_PLUGIN_DIR=. npm run build`

## Risks and Mitigations
- Risk: broad type migration breaks unrelated tests.
  - Mitigation: land domain/type changes first with targeted compatibility tests.
- Risk: snapshot churn masks regressions.
  - Mitigation: isolate snapshot commit and review it explicitly before merge.
- Risk: settings-driven categories diverge between import and card-creation routes.
  - Mitigation: assert both routes via integration tests and shared filter utility tests.

