# Test Contract: BUG-008 Source Naming Policy

**Story:** `docs/stories/BUG-008-source-name-strategy-regression.md`  
**Implementation Plan:** `docs/plans/BUG-008-moonreader-name-regression.md`  
**Style:** TDD-first

## Scope
Fix source-name regression where MoonReader notes can appear as generic `Annotations` labels after basename standardization.

## Naming Contract
1. MoonReader source naming
- If MoonReader frontmatter has `title`, source name must use that title.
- Generic basename `Annotations` must not be used when title is present.

2. Direct-markdown source naming
- Name continues to use basename policy.
- Existing clipping/direct-markdown behavior remains unchanged.

3. Consistency across API surfaces
- `getSourcesForReview` and `getSourcesAvailableForDeckCreation` must reflect the same naming policy for a given source.

## Tests to Add/Update
1. `tests/api.test.ts`
- Add explicit naming contract assertions for:
  - MoonReader fixture source (`Atomic Habits/Annotations.md`) expects `Atomic Habits`.
  - Direct-markdown/clipping fixture source expects basename (`constitution`).
- Ensure both list APIs (`getSourcesForReview`, `getSourcesAvailableForDeckCreation`) are covered.

2. `tests/api.clippings.test.ts`
- Keep direct-markdown basename assertion as regression guard.
- Optional: strengthen to explicit contract object shape if needed.

## Fixture Strategy
- Reuse existing fixtures:
  - `getMetadataForFile_Atomic-Habits_Annotations.json`
  - `getTFileForPath_Atomic-Habits_Annotations.json`
  - constitution/clippings fixtures already used in API tests.
- No new fixture generation unless blocked.

## Planned Code Touchpoint
- `src/data/models/AnnotationsNote.ts`
  - naming derivation in `initialize()` and `updatePath()`.

## Gates
1. `npm test -- --runInBand tests/api.test.ts tests/api.clippings.test.ts`
2. `npm test -- --runInBand`
3. `OBSIDIAN_PLUGIN_DIR=. npm run build`

## Drift Policy
Pause and re-approve if:
- fix requires changes beyond name derivation,
- fixture additions become required,
- unrelated snapshot churn appears.
