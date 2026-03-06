# STORY-032: Test Vault Scenario Coverage Catalog

## Status
In Progress

## Reviewed
No

## Epic
None

## Description
The current `tests/vault/` files were derived from whatever happened to be captured, not designed around specific user behaviors. This means test coverage reflects the past, not the scenarios that matter.

The vault should be a deliberate scenario catalog: each file exists to exercise a specific behavior, and gaps in coverage should be visible and trackable.

## Acceptance Criteria
- [ ] `tests/vault/scenarios.md` documents every vault file, what scenario it covers, and what user behavior it exercises
- [ ] Missing scenarios identified (see Notes) have corresponding synthetic vault files added
- [ ] Each new vault file has corresponding fixtures captured from Obsidian (getFileContents, getMetadataForFile, getTFileForPath, fileTags, filePathsWithTag as applicable)
- [ ] `npm run vault:check` passes after all new fixtures are captured
- [ ] Existing tests still pass (`npm test`)

## Likely Touchpoints
- `tests/vault/` — new scenario directories and `.md` files
- `tests/vault/scenarios.md` — new catalog file
- `tests/fixtures/` — new captured fixtures for each new vault file
- `tests/api.test.ts` or new test files — tests exercising new scenarios

## Notes

**Scenarios currently covered:**
- MoonReader book with annotations + flashcards sidecar (Atomic Habits, Memory)
- Web clipping / non-MoonReader source (Claude's Constitution)
- Minimal edge-case file (Untitled, constitution)
- Simple MoonReader annotations, no flashcards (Learning)

**Scenarios missing:**
- Book with annotations but no flashcards file yet → tests flashcard file creation flow
- Book where all annotations are soft-deleted → tests coverage calculation at 0%
- Annotation with personal notes/metadata added → tests annotation metadata update flow
- Book at 100% coverage (all annotations have cards) → tests completion state
- Empty chapter section (heading with no annotations below it) → tests section tree edge case
- Multiple books to exercise sort/filter in the source list

Each missing scenario should become a dedicated directory in `tests/vault/` with synthetic lorem ipsum content following existing conventions.

## Plan
See `docs/plans/STORY-032-vault-scenario-coverage.md`

## Related
- [STORY-018](STORY-018-test-vault-fixture-consistency.md) — vault as re-capture source (Done, prerequisite)
- [DEBT-041](DEBT-041-vault-check-incomplete-fixture-coverage.md) — vault:check only verifies getFileContents

## Depends on
- STORY-018 (Done)
