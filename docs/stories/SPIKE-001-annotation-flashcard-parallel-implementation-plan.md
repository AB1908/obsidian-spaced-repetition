# SPIKE-001: Annotation Flashcard Delivery Plan (Parallel Agent Execution)

## Status
Ready

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## Depends on
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md) — deck creation entrypoint and clipping mutation flow are in place
- [STORY-010c](STORY-010c-drift-detection.md) — fingerprint/drift core exists

## Blocks
- [DEBT-011](DEBT-011-book-metaphor-clippings.md) — this plan is the execution strategy for resolving the clippings end-to-end break

## User Story
As a user creating decks from markdown/clippings sources, I want to navigate source content and create flashcards reliably after deck creation, so that the flow is usable end-to-end.

## Scope
This plan defines implementation sequencing and agent delegation boundaries for the current primary goal: **create flashcards for annotations/paragraphs reliably in markdown/clippings sources**.

## Ground Truth (Verified in Current Code)
- Markdown source extraction and fingerprint plumbing are implemented (`MarkdownSourceStrategy`, fingerprint metadata parse/serialize, drift flagging).
- Deck creation for clippings mutates source (block IDs), folderizes file, and creates `Flashcards.md`.
- Main open functional break: clippings created through new flow can end up with empty/incorrect chapter-annotation navigation (`DEBT-011`).
- Navigation API still ignores UI filters (`BUG-001`); known failing contract tests are already documented.
- API naming/policy duplication remains (`DEBT-008`) and is low-risk to fix in parallel if scoped carefully.

## Execution Strategy
1. Fix end-to-end clipping navigation/data refresh first (critical path).
2. Then align navigation filter contract (BUG-001) once the clippings navigation model is stable.
3. Run low-conflict cleanup/debt tracks in parallel where they do not touch the same files.

## Critical Path Workstream (Must Complete in Order)

### CP-1: Reproduce and lock failing clippings behavior with tests
Goal: Convert DEBT-011 symptom into deterministic tests before refactor.

Acceptance:
- [ ] Add observation test(s) in `tests/api.test.ts` (or dedicated `tests/api.clippings-navigation.test.ts`) for post-deck-creation clippings state.
- [ ] Explicitly assert expected section/annotation availability after `createFlashcardNoteForAnnotationsNote(..., { confirmedSourceMutation: true })`.
- [ ] Tests fail on current behavior if bug still exists, or pass and document true root cause if symptom has shifted.

Primary files:
- `tests/api.test.ts` or `tests/api.clippings-navigation.test.ts`
- `docs/stories/DEBT-011-book-metaphor-clippings.md` (session notes update)

---

### CP-2: Repair clippings navigation model after deck creation
Goal: Ensure source note model/state reflects mutated file and routes can render content.

Acceptance:
- [ ] Post-mutation source path/state is consistent in index and in-memory model.
- [ ] `getBookChapters` / `getAnnotationsForSection` behavior for direct-markdown source is defined and test-covered.
- [ ] User can navigate from deck landing to selectable content and create cards.

Likely code touchpoints:
- `src/api.ts` (`createFlashcardNoteForAnnotationsNote`, section retrieval APIs)
- `src/data/models/AnnotationsNote.ts` (reinitialize/refresh behavior and source model traversal)
- `src/ui/routes/books/book/index.tsx`
- `src/ui/routes/books/book/annotation/AnnotationListPage.tsx`

Constraint:
- Do not implement broad UI redesign in this step. Keep to minimal behavior-correct changes.

---

### CP-3: Close navigation-filter contract gap (BUG-001)
Goal: Navigation previous/next must respect active filters.

Acceptance:
- [x] `getNextAnnotationId` / `getPreviousAnnotationId` accept optional filter contract.
- [x] UI passes current filter context to navigation calls.
- [x] Integration tests assert processed/unprocessed/category/color behavior at section boundaries.

Likely code touchpoints:
- `src/api.ts`
- `src/ui/routes/books/api.ts`
- `src/ui/routes/books/book/annotation/annotation-with-outlet.tsx`
- `src/ui/components/annotation-display-list.tsx`
- `tests/api.test.ts`
- `tests/routes_books_api.test.ts`

## Parallel Workstreams (Can Run in Separate Agents)

### P-1 (Low Conflict): Naming/policy cleanup for source listing (DEBT-008)
Value: reduce ambiguity before more feature work.

Acceptance:
- [ ] Rename `getNotesWithoutReview` to a source-creation-oriented name.
- [ ] Centralize clipping-mutation-confirmation policy in one place.
- [ ] Keep backward-compatible export shim if needed for gradual migration.

Likely code touchpoints:
- `src/api.ts`
- `src/ui/components/book-list.tsx`
- `tests/api.test.ts`
- `tests/api.clippings.test.ts`

Conflict note:
- This touches `src/api.ts`, so do not run concurrently with CP-2/CP-3 unless split by agreed function ownership.

---

### P-2 (Independent): Capture/fixture workflow hardening (DEBT-010)
Value: improves speed/quality of future bug reproduction; no runtime behavior risk.

Acceptance:
- [ ] Document standard capture -> fixture staging -> promotion workflow.
- [ ] Add lightweight tooling notes/scripts if practical.
- [ ] Define fixture representativeness checklist (path realism, frontmatter/tag variants, large content strategy).

Likely code/docs touchpoints:
- `docs/stories/DEBT-010-capture-fixture-cycle.md`
- `docs/guides/testing-notes.md` and/or `docs/guides/testing.md`
- optional: `scripts/` helper(s)

Conflict note:
- Safe to run in parallel with all critical-path work.

---

### P-3 (Deferred Parallel, after CP-2): UI class/component cleanup (DEBT-012)
Value: removes semantic CSS misuse and reduces future UI churn.

Acceptance:
- [ ] Replace semantic class misuse in source chooser rows.
- [ ] Extract reusable list/tree primitive only if it does not force domain rewrite.
- [ ] Evaluate replacing `window.confirm` with Obsidian modal API.

Likely code touchpoints:
- `src/ui/components/book-list.tsx`
- `src/ui/components/ChapterList.tsx`
- `styles.css`

Conflict note:
- Avoid running in parallel with CP-2 while route/content behavior is changing.

## Merge-Conflict Avoidance Plan

### File Ownership Rules
- Agent CP owns: `src/api.ts`, `src/data/models/AnnotationsNote.ts`, clippings navigation tests.
- Agent NAV owns (starts after CP-2 freeze): navigation filter files (`annotation-with-outlet`, route API wrappers, navigation tests).
- Agent FIXTURE owns docs/scripts only (`docs/guides/*`, `docs/stories/DEBT-010*`, optional `scripts/*`).
- Agent UI cleanup starts only after CP branch merge; rebases on latest mainline.

### Sequencing
1. CP-1 + CP-2 on one branch/worktree.
2. Merge CP-2.
3. Start CP-3 (navigation contract) on fresh branch from updated base.
4. Run FIXTURE stream at any time.
5. Run UI cleanup after CP-2 merge to avoid churn in `book-list.tsx`.

### Branch Suggestions
- `fix/clippings-navigation-model` (CP-1 + CP-2)
- `fix/navigation-filter-contract` (CP-3 / BUG-001)
- `chore/fixture-capture-workflow` (P-2)
- `refactor/source-chooser-ui-primitives` (P-3)

## Delegation Pack (Per-Agent Hand-off)

### Agent A: Clippings End-to-End Fix (CP-1 + CP-2)
- Task: Implement and test post-deck-creation clippings navigation/content correctness.
- Must not edit: `src/ui/components/annotation-display-list.tsx` filter UX semantics unless required.
- Deliverables: green tests + concise architecture note in DEBT-011 session notes.

### Agent B: Navigation Filter Contract (CP-3)
- Task: implement ADR-019-compatible filter-aware previous/next navigation.
- Start only after Agent A merges.
- Deliverables: passing integration tests replacing current KNOWN BUG placeholders.

### Agent C: Capture Workflow (P-2)
- Task: docs/tooling-only improvements for fixture capture cycle.
- Can run immediately in parallel.
- Deliverables: updated guides + minimal operational checklist.

### Agent D: UI Reusability Cleanup (P-3)
- Task: class semantics/component reuse cleanup, optional confirmation modal abstraction.
- Start after Agent A merges.
- Deliverables: visual parity + no behavior regressions in source chooser flow.

## Risks and Mitigations
- Risk: CP-2 and CP-3 both require `src/api.ts` edits.
  Mitigation: enforce strict sequencing (CP-3 rebases after CP-2 merge).
- Risk: Tests currently encode implementation details in clippings flow.
  Mitigation: migrate critical tests toward behavior/final-state assertions while preserving existing fixtures.
- Risk: Domain-model ambiguity (book/chapter metaphor) causes over-refactor.
  Mitigation: constrain CP-2 to minimal viable model/route behavior; defer redesign to follow-up story if needed.

## Exit Criteria for This Plan
- [ ] User can create deck from clippings source and then add cards from visible content reliably.
- [ ] Filtered navigation behaves predictably and matches UI-visible set.
- [ ] No unresolved blocker remains in DEBT-011 and BUG-001 for this goal.
- [ ] Parallel streams merged without file-level conflict churn.

## Related
- [DEBT-011](DEBT-011-book-metaphor-clippings.md)
- [BUG-001](BUG-001-navigation-ignores-filters.md)
- [DEBT-008](DEBT-008-notes-without-review-naming.md)
- [DEBT-010](DEBT-010-capture-fixture-cycle.md)
- [DEBT-012](DEBT-012-component-reusability.md)
- ADR: [ADR-019](../decisions/ADR-019-navigation-filter-contract.md)
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
