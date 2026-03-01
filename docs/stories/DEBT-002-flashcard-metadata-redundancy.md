# DEBT-002: FlashcardMetadata Interface Redundancy

## Status
Backlog

## Description
`FlashcardMetadata` in `src/data/parser.ts` duplicates fields already carried by `AbstractFlashcard` in `src/data/models/flashcard.ts` (specifically: `ease`, `dueDate`, `interval`, `flag`, `fingerprint`, `annotationId`/`parentId`). It exists as a parsing intermediate — `parseMetadata()` returns it, then the `Flashcard` constructor copies every field into its own properties.

The constructor comment on line 51-52 of `flashcard.ts` still reads: "cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading probably should change this to be a union type." The `FlashcardMetadata` interface is exported from `parser.ts` and imported in `flashcard.ts`, meaning the two-representation pattern is still active.

`createFlashcard()` (in `flashcard.ts`) calls `parseMetadata(parsedCard.metadataText)` then passes the result to `new Flashcard(...)`, which spreads every field from the metadata into the class instance. The round-trip exists solely because the constructor is the consumer, not the parser.

`parsedCardStorage.ts` now exists and owns the card-on-disk write operations (DEBT-007 done). However, the metadata interface split between `parser.ts` and `flashcard.ts` was not addressed as part of that work.

## Impact
- Cognitive overhead: two types representing the same scheduling and identity data
- Constructor complexity: `cardMetadata` vs `annotationId` as mutually exclusive constructor paths, acknowledged but unresolved
- Any new metadata field (as `fingerprint` demonstrated) must be added in both `FlashcardMetadata` and `AbstractFlashcard`

## Acceptance Criteria
- [ ] `FlashcardMetadata` scoped internally to parser (not exported) or eliminated
- [ ] `Flashcard` constructor simplified — single creation path without dual-parameter branching
- [ ] No duplicate field definitions across `parser.ts` and `flashcard.ts`

## Likely Touchpoints
- `src/data/parser.ts` — `FlashcardMetadata` interface, `parseMetadata()` function
- `src/data/models/flashcard.ts` — `AbstractFlashcard`, `Flashcard`, constructor, `createFlashcard()`
- `src/data/models/parsedCard.ts` — `ParsedCard` (consumed alongside `FlashcardMetadata` in construction)
- `src/data/utils/parsedCardStorage.ts` — card write helpers (no metadata duplication here, but related boundary)

## Related
- [DEBT-001](DEBT-001-inconsistent-data-models.md) — overlapping type design issues
