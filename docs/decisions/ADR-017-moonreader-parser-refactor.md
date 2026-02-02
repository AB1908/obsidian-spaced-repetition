# ADR-017: Decoupling MoonReader Parser from Sync Logic

## Status
Proposed

## Context
The current `parseMoonReaderExport` function in `src/data/import/moonreader.ts` is responsible for both parsing raw text and filtering that text based on a `sinceId`. 

As we move toward the **Sidecar Annotation Architecture (ADR-016)**, we need our parsers to be "pure"—they should simply transform text into objects. Filtering, syncing, and determining "newness" are domain-level concerns that belong in models or dedicated sync utilities.

## Decision
We will refactor the MoonReader import logic to separate parsing from filtering.

1.  **Pure Parser:** `parseMoonReaderExport` will be stripped of its `sinceId` parameter and filtering logic. It will return a full array of `MoonReaderAnnotation` objects.
2.  **Filter Utility:** A new utility `filterAnnotationsSinceId` (or similar) will be created to handle the incremental sync logic.
3.  **Model Update:** `SourceNote.syncMoonReaderExport` will be updated to coordinate these two steps.

## Consequences

**Positive:**
- **Testability:** We can write simple, deterministic unit tests for the parser without worrying about filtering state.
- **Reusability:** The parser can be used in contexts where we want the *entire* file (like an initial import or a "Coverage" check) without hacky workarounds.
- **Predictability:** Follows the Single Responsibility Principle.

**Negative:**
- **Performance:** Minor overhead in memory as the full list is parsed before being filtered (negligible for typical `.mrexpt` file sizes).

## Alternatives Considered
- **Options Object:** Considered keeping the filter inside the parser but using a named `options` object. Rejected in favor of full decoupling to simplify the parser's internal loop.

## References
- User Story: "Decouple MoonReader Parsing from Sync Logic" in `docs/features/user_stories.md`.
