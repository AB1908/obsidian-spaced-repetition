# DEBT-031: Deterministic Modularization and Domain Model Evolution

## Status
Ready

## Epic
None

## Depends on
- [DEBT-022](DEBT-022-api-module-decomposition-for-verifiability.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
- [DEBT-023](DEBT-023-storage-port-and-obsidian-adapter-boundary.md)
- [DEBT-006](DEBT-006-disk-business-logic.md)

## Description
The codebase has accumulated long, mixed-concern modules (`src/data/models/AnnotationsNote.ts`, `src/api.ts`) and naming/model drift that makes refactoring risky. We need a deterministic, test-gated modularization phase first, followed by deliberate domain model evolution.

This story formalizes that sequence:
1. **Phase A:** structure-only extraction into appropriately named modules, no behavior changes.
2. **Phase B-D:** model evolution toward source-extensible architecture (for example `FlashcardSource` composition), with explicit tradeoff analysis and migration sequencing.

## Acceptance Criteria

### Phase A (structure-only extraction)
- [ ] Move-only extraction, small reversible commits, compiler + test gates.
- [ ] `src/data/models/AnnotationsNote.ts` decomposed into focused modules with unchanged behavior.
- [ ] `src/api.ts` decomposed into focused application modules with stable outward API surface.
- [ ] Contract/snapshot tests green after each extraction milestone.

### Phase B (domain model evolution)
- [ ] `ReviewSession` extracted as pure state machine (returns `SchedulingUpdate`, no IO).
- [ ] `FlashcardDeck` introduced as read-only view over FlashcardNote.
- [ ] `StudyNote` unified type replaces `annotation | paragraph` union.
- [ ] `ISourceStrategy` expanded with write methods (`renderNote`, `ensureBlockIds?`, `mutateNote?`).
- [ ] `SourceContent` extracted with navigation (prev/next) and queries.
- [ ] `AnnotationsNote` renamed to `FlashcardSource` with deprecated aliases.
- [ ] `api.ts` decomposed into `src/application/` modules.
- [ ] `Source` stub class removed.
- [ ] All tests green after each phase.

## Likely Touchpoints
- `src/data/models/AnnotationsNote.ts`
- `src/data/models/index.ts`
- `src/data/models/strategies/*`
- `src/api.ts`
- `src/application/*` (new)
- `src/data/models/sections/*` (new)
- `src/data/models/annotations-note/*` (new)
- `docs/guides/architecture/*`
- `tests/api.test.ts`
- `tests/api_orchestrator.test.ts`
- `tests/routes_books_api.test.ts`
- `tests/book.test.ts`

## Plans
- [Domain Model Realignment Plan (v2)](../plans/DEBT-031-domain-model-realignment.md) — current
- [Deterministic Modularization + Domain Model Evolution Plan](../archive/DEBT-031-deterministic-modularization-and-domain-model-evolution-plan.md) — original Phase A plan (archived)

## Architecture Decisions
- [ADR-021: StudyNote Unified Content Type](../decisions/ADR-021-studynote-unified-content-type.md)
- [ADR-022: FlashcardSource Composition with Strategy-Owned Writes](../decisions/ADR-022-flashcardsource-composition.md)
- [ADR-023: FlashcardDeck and Pure ReviewSession](../decisions/ADR-023-flashcarddeck-and-pure-reviewsession.md)
- [ADR-018: Source Model Architecture](../decisions/ADR-018-source-model-architecture.md) — superseded by ADR-022

## Sessions
- [2026-02-18: Domain Model Architecture Refinement](../sessions/2026-02-18-domain-model-architecture-refinement.md)
- [2026-02-18: Domain Modeling Context Handoff](../sessions/2026-02-18-domain-modeling-context-handoff.md)
- [Execution: 2026-02-19 DEBT-031 History Curation](../executions/EXEC-2026-02-19-DEBT-031-history-curation.md)

## Related
- [DEBT-022](DEBT-022-api-module-decomposition-for-verifiability.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
- [DEBT-011](../archive/stories/DEBT-011-book-metaphor-clippings.md)
- [DEBT-001](DEBT-001-inconsistent-data-models.md)
- [DEBT-030](../archive/stories/DEBT-030-complete-markdown-source-migration.md)
