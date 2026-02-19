# Domain Modeling Context Handoff (2026-02-18)

## Purpose
Capture current understanding of layout, model boundaries, naming drift, and future-state options so a separate session can resume architecture work while DEBT-031 Phase A execution is in progress elsewhere.

## Current Layout (As-Is)

### Module Layers
1. **Composition root / plugin lifecycle**
   - `src/main.ts`
2. **Application/orchestration facade**
   - `src/api.ts`
   - `src/ui/routes/books/api.ts` (thin route adapter)
3. **Domain + data model**
   - `src/data/models/*`
   - `src/data/source-discovery.ts`
   - `src/data/parser.ts`
   - `src/data/import/moonreader.ts`
   - `src/data/utils/*`
4. **Infrastructure adapters**
   - `src/infrastructure/disk.ts`
   - `src/infrastructure/obsidian-facade.ts`

### High-Gravity Files
1. `src/data/models/AnnotationsNote.ts`
   - Mixed responsibilities: parsing sections, navigation graph helpers, review session state, flashcard operations, source capability checks, index class.
2. `src/api.ts`
   - Mixed orchestration: review endpoints, source/deck flows, import/export, navigation helpers, markdown source mutation helpers.

## Domain/Responsibility Snapshot

### Core classes/interfaces in active use
1. `AnnotationsNote` + `AnnotationsNoteIndex`
2. `Flashcard`, `FlashcardNote`, `FlashcardIndex`
3. `ISourceStrategy`, `MarkdownSourceStrategy`, `MoonReaderStrategy`
4. `SourceCapabilities` contract and policy builders
5. `Source` class exists but currently under-leveraged

### Key drift points
1. **Naming drift:** `book`, `frontbook`, “chapters” language used for non-book markdown sources.
2. **Ownership drift:** markdown mutation helpers (`addBlockIdsToParagraphs`, folder move logic) sit in `src/api.ts` instead of source/domain service boundary.
3. **Boundary drift:** `disk.ts` includes business-flavored logic alongside adapter concerns.

## Specific Concerns Raised
1. `AnnotationsNote` appears misnamed for generalized source handling.
2. Interface bloat risk if extensibility is handled with one large contract.
3. `Heading` likely does not need class semantics; may be better as a plain type with pure functions.
4. Need deterministic refactor mechanics (non-handwavy, test-gated, low drift risk).

## Agreed Execution Direction

### Immediate
1. Execute **Phase A** first (structure-only modularization, no behavior changes).
2. Keep architecture redesign discussion separate from extraction execution.

### Planning assets created
1. Story: `docs/stories/DEBT-031-deterministic-modularization-and-domain-model-evolution.md`
2. Plan: `docs/plans/DEBT-031-deterministic-modularization-and-domain-model-evolution-plan.md`
3. Meta-organization backlog: `docs/stories/DEBT-032-task-organization-model-to-reduce-planning-duplication.md`

## Future-State Architecture Options (Post-Phase A)

1. **Composition model (recommended)**
   - `FlashcardSource` aggregate that composes:
     - `SourceContentStrategy` (extract/sync/navigable sections)
     - `FlashcardStore` (sidecar card persistence + scheduling writes)
     - `ReviewSession` (runtime review state)
2. **Class-per-source inheritance**
   - Explicit variants, but risk of duplication/rigidity.
3. **Functional core + discriminated unions**
   - Strong TS modeling and testability, but larger migration.
4. **Minimal change (only file splits)**
   - Lowest short-term risk, preserves conceptual debt.

## Pain-Driven Decision Heuristics
1. If pain is “hard to navigate code,” do Phase A only first.
2. If pain is “new source type causes conditionals everywhere,” move to composition-based `FlashcardSource`.
3. If pain is “type churn/interface noise,” favor discriminated unions and smaller contracts.
4. If pain is “review/runtime state coupling bugs,” extract `ReviewSession` early.

## Open Questions to Resume Later
1. Should `AnnotationsNote` be renamed to `StudySource`/`LearningSource`/`FlashcardSource` (or wrapped by a new aggregate)?
2. Should `Source` be integrated as the primary shell or removed to reduce confusion?
3. Should `Heading` become a plain type in Phase B or later (after Phase A stabilization)?
4. What is the migration strategy for existing call sites when renaming book-shaped APIs?

## Resume Checklist
1. Re-read DEBT-031 plan and this handoff note.
2. Review Phase A extraction diffs first to avoid mixing semantic changes.
3. Re-open architecture choices only after confirming extraction baseline is stable.
