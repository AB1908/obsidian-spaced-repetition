# Testing Contract: 0.6.0

## Purpose
Define deterministic test gates for source strategy, naming, and annotation-processing behavior so regressions are caught before merge.

This is a contract for 0.6.0 execution, not a full E2E framework rollout.

## Applies To
Any PR touching:
- source naming (`AnnotationsNote.name`, source chooser labels)
- chapter/navigation strategy (`getBookChapters`, source strategies)
- import annotation editor/navigation state
- filter UX and processed/unprocessed behavior

## Required Gates (Per PR)
1. `npm test`
2. `OBSIDIAN_PLUGIN_DIR=. npm run build`
3. Contract assertions reviewed (below)
4. Snapshot diff review completed (targeted only)

## Contract Assertions

## A. Source Naming Contract
- Direct markdown source label uses filename/basename.
- MoonReader source label uses MoonReader-specific policy (to be finalized in BUG-008):
  - preferred: frontmatter title
  - fallback: folder/book label
  - final fallback: basename
- `getSourcesForReview` and `getSourcesAvailableForDeckCreation` must follow the same naming policy.

## B. Navigable Sections Contract
- MoonReader: H1 chapters only (existing intent).
- Direct markdown: H1-first strategy, with H2 fallback when no H1 (BUG-007).
- Section list must not flatten all heading levels by default.

## C. Import Editor State Contract
- Navigating prev/next annotation reinitializes editor state to destination annotation.
- Save-before-navigation remains intact.
- Navigation should not carry stale personal note/category state to next annotation.

## Fixture Matrix (Minimum Required for 0.6.0)

| Case | Why | Expected Covered By |
|---|---|---|
| MoonReader note named `Annotations.md` in folder | catches naming regression class | `tests/api.test.ts` |
| Direct markdown root file (`constitution.md`) | verifies basename behavior | `tests/api.test.ts`, `tests/api.clippings.test.ts` |
| Direct markdown nested file (`Clippings/constitution.md`) | verifies path/context behavior | `tests/api.test.ts` |
| Mixed headings (H1/H2/H3) | catches flattening strategy drift | `tests/api.test.ts` |
| H2-only markdown file | verifies fallback strategy | `tests/api.test.ts` |
| No-heading markdown file | boundary behavior | `tests/api.test.ts` |
| Import editor navigation with unsaved edits | catches state leak | `tests/routes/import/PersonalNotePage.test.tsx` |

## Snapshot Review Rules
- Do not bulk-accept snapshot updates.
- For each changed snapshot:
  - identify the behavior contract it represents
  - verify the behavior change is intended by the story/bug
  - note unchanged contract snapshots in PR summary
- If snapshot changed but no contract changed, treat as regression until proven otherwise.

## PR Checklist Snippet
- [ ] Ran required gates (`npm test`, build)
- [ ] Verified source naming contract
- [ ] Verified navigable section strategy contract
- [ ] Verified import editor state contract (if applicable)
- [ ] Reviewed snapshot deltas intentionally
- [ ] Added/updated fixtures for new edge cases

## E2E Escalation Policy (Rule of 3)
Defer full vault-based E2E tooling (Obsidian CLI/capture pipeline) until this pain repeats 2-3 more times in materially similar regressions.

Trigger implementation when either threshold is hit:
1. Same regression class escapes fixture-based tests 3 times.
2. Fixing fixture realism blocks delivery in 3 separate sessions.

When triggered, execute DEBT-010 as the implementation track (vault artifact + capture workflow).
