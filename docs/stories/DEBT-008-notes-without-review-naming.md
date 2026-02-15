# DEBT-008: getNotesWithoutReview Naming and Complexity

## Status
Ready

## Epic
None

## Description
`getNotesWithoutReview()` in `src/api.ts:264` has two issues:

### Misleading Name
The name suggests a review-state query ("which notes haven't been reviewed?") but actually returns sources that don't have flashcard files yet — a resource/capability query. Better names: `getSourcesWithoutFlashcards()`, `getSourcesAvailableForDeckCreation()`.

### Overcomplicated Mapping
The function fetches sources via `annotationsNoteIndex.getSourcesWithoutFlashcards()` then maps each one to compute `sourceType` and `requiresSourceMutationConfirmation`. The mutation-confirmation logic (`hasTag(tags, "clippings") && !hasMoonReaderFrontmatter`) duplicates the same check in `createFlashcardNoteForAnnotationsNote` (api.ts:317-318). This couples a listing function with flow-control policy that belongs in the creation path.

## Impact
- Name confusion when reading code or searching for review-related logic
- Duplicate business logic for mutation confirmation — changes need to be made in two places
- Mixes listing concern with mutation policy

## Acceptance Criteria
- [ ] Rename function to better reflect its purpose
- [ ] Deduplicate mutation-confirmation logic (single source of truth)
- [ ] Consider whether sourceType computation belongs here or in source-discovery module

## Related
- [DEBT-005](DEBT-005-source-discovery-policy-boundary.md) — source discovery policy boundary
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md) — introduced this function
