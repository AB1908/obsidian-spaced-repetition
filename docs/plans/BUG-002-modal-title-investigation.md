# Plan: BUG-002 — Modal Title Navigation (Investigation)

**Status:** To Be Verified
**Story:** [BUG-002](../stories/BUG-002-modal-title-navigation.md)
**Agent:** Manual verification first
**Branch:** N/A (likely already fixed)

## Investigation Summary (2026-02-17)

### Architecture is Sound
- `ModalTitleProvider` (`src/ui/modals/ModalTitleContext.tsx:17-33`) properly listens to URL param changes via `useParams()` hook with effect dependency on `[bookId, sectionId]`
- `EditCard` (`src/ui/routes/books/card/edit-card.tsx:18-20`) sets title to "Editing: [question]" on render
- When route changes after edit/navigation, ModalTitleProvider re-runs and resets to breadcrumb format
- Root component test (`tests/root.test.tsx`) verifies title wiring

### Likely Resolved by BUG-001
The original bug was caused by BUG-001 (navigation returning wrong annotation due to filter mismatch). When navigation returned the wrong annotation:
1. URL params may not change (same annotationId)
2. ModalTitleProvider's effect doesn't re-run
3. Title stays stuck at "Editing: [question]"

With BUG-001 fixed (on main since commit `37947f9`), navigation returns correct annotations, URL params change properly, and ModalTitleProvider resets.

### Verdict
**Likely fixed.** Needs manual verification in Obsidian test vault before closing:
1. Open a deck → navigate to annotation → edit flashcard
2. Verify title shows "Editing: [question]"
3. Submit edit → verify title resets to breadcrumb
4. Navigate to next annotation → verify title updates

### Gap
No integration test covers the full EditCard→navigate→title-reset flow. Consider adding one if bug recurs.

## Action
- Verify manually during v0.6.0 smoke test
- If confirmed fixed: close BUG-002 as Done
- If still broken: file detailed plan (likely needs explicit title cleanup in EditCard's useEffect return)
