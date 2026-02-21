# STORY-012: Drift Detection UX Flow

## Status
Backlog

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Branch
TBD

## User Story
As a reviewer, I want to be informed when a flashcard's source paragraph has changed, so that I can decide whether to update, re-anchor, or dismiss the flashcard before continuing my review.

## Context
Drift detection (`detectDrift()` in AnnotationsNote) currently sets `paragraph.drifted = true` at initialization time. But this flag has no consumer — it doesn't surface in review, editing, or any UI flow.

### Design Considerations

**When to surface drift:**
- Option A: Block review — force user to resolve drifted flashcards before starting review session. Ensures no stale cards are reviewed, but adds friction.
- Option B: Inline warning — show drift indicator during review. User can skip, update, or dismiss. Less friction, but user might ignore.
- Option C: Separate triage view — dedicated "Drifted Cards" list accessible from book landing page. Non-blocking but proactive.

**State ownership:**
Currently `drifted` lives on `paragraph`, but the flashcard is what needs updating. Options:
- `Flashcard.hasDrifted(currentText): boolean` — query method on flashcard, using its stored fingerprint. More semantic, flashcard owns its own integrity check.
- Shared state via annotation index — paragraph marks drift, flashcard reads it via parent link.
- Derived at render time — compute drift only when displaying, not at init.

**detectDrift() placement:**
Current placement in `AnnotationsNote.initialize()` is pragmatic for upfront detection but couples drift logic to the annotations model. Moving `hasDrifted()` to `Flashcard` as a method would decouple it and allow drift checks in any context (review, editing, API).

## Open Questions
- Should drift block review or just warn?
- Does resolving drift mean updating the fingerprint, or re-creating the flashcard?
- Should there be a "re-anchor" action that updates the fingerprint without changing flashcard content?
- Is this a proven need yet, or should we wait for user feedback? (Frequency-of-need tracking per ADR-020)

## Acceptance Criteria
- [ ] User story validated (proven need)
- [ ] UX flow designed and documented
- [ ] `Flashcard.hasDrifted()` method implemented (decouple from AnnotationsNote)
- [ ] UI component for drift indication
- [ ] "Re-anchor" or "Update fingerprint" action

## Related
- [STORY-010c](../archive/stories/STORY-010c-drift-detection.md) — drift detection implementation
- [DEBT-001](DEBT-001-inconsistent-data-models.md) — union type issues affect drift traversal
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
