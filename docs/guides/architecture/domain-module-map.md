# Domain Module Map

## Status
Draft

## Purpose
Document current ownership boundaries after deterministic modularization work, so future model changes can happen without re-litigating file placement.

## Layer Overview

1. Composition Root
   - `src/main.ts`
   - Bootstraps plugin, indexes, and API plugin context.

2. API Facade (compatibility surface)
   - `src/api.ts`
   - Public export surface for UI/routes.
   - Must remain thin: no business logic.

3. Application Modules
   - `src/application/review-api.ts`
   - `src/application/source-api.ts`
   - `src/application/navigation-api.ts`
   - `src/application/import-api.ts`
   - `src/application/annotation-api.ts`
   - `src/application/deck-api.ts`
   - `src/application/deck-creation-helpers.ts`
   - `src/application/plugin-context.ts`

4. Domain Models
   - `src/data/models/annotations-note/AnnotationsNote.ts`
   - `src/data/models/annotations-note/AnnotationsNoteIndex.ts`
   - `src/data/models/annotations-note/*` (modular helpers)
   - `src/data/models/annotations-note/types.ts`
   - `src/data/models/flashcard.ts`
   - `src/data/models/FlashcardSourceStrategy.ts`
   - `src/data/models/sections/*`
   - `src/data/models/strategies/*`
   - `src/data/models/sourceCapabilities.ts`

5. Domain Parsers/Utilities
   - `src/data/import/moonreader.ts`
   - `src/data/parser.ts`
   - `src/data/utils/*`
   - `src/data/source-discovery.ts`

6. Infrastructure Adapters
   - `src/infrastructure/disk.ts`
   - `src/infrastructure/obsidian-facade.ts`

## Ownership Guide

1. `sections/*`
   - Types, guards, heading graph traversal, and section parsing.
   - Should not depend on application modules.

2. `annotations-note/*`
   - Source aggregate orchestration, review/card mutations, and source initialization helpers.
   - Can depend on models, utils, and infrastructure adapters.
   - Keep operations pure where possible (single-purpose helper modules).

3. `FlashcardSourceStrategy`
   - Strategy contract for source-specific navigation and extraction/sync behavior.
   - `ISourceStrategy` remains compatibility alias only during migration.

4. `application/*`
   - Orchestration functions exported via `src/api.ts`.
   - Depends on domain/infrastructure; domain does not depend on application.

5. `src/api.ts`
   - Re-export module only + `setPlugin(...)` context wiring.
   - Any non-trivial logic here should be moved to `src/application/*`.

## Dependency Direction Rules

1. `src/application/*` -> `src/data/*`, `src/infrastructure/*` is allowed.
2. `src/data/*` -> `src/application/*` is not allowed.
3. `src/infrastructure/*` should avoid importing from `src/application/*`.
4. `src/api.ts` can import from `src/application/*` only.

## Current Exceptions / Known Debt

1. `src/data/models/annotations-note/AnnotationsNote.ts` still orchestrates review flow state and should be slimmed further into explicit session object if review complexity grows.
2. `src/infrastructure/disk.ts` still contains some business-flavored helpers.
3. Naming debt remains (`book`, `frontbook`) and is deferred to post-Phase A migration.

## Next Refactor Targets (Post-Phase A)

1. Extract review session state machine from `AnnotationsNote`.
2. Move source-mutation ownership behind source-specific strategy/service boundary.
3. Rename source-neutral contracts and preserve compatibility aliases for transition.
