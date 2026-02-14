# DEBT-002: FlashcardMetadata Interface Redundancy

## Status
Backlog

## Description
`FlashcardMetadata` in `parser.ts` duplicates fields already on `AbstractFlashcard` (ease, dueDate, interval, flag, fingerprint, annotationId/parentId). It exists as a parsing intermediate — `parseMetadata()` returns it, then `Flashcard` constructor copies every field into its own properties.

This creates two representations of the same concept and makes the constructor awkward (comment on line 75-76 of flashcard.ts acknowledges this: "cardMetadata and highlight ID are mutually exclusive properties").

## Impact
- Cognitive overhead: two types representing the same data
- Constructor complexity: cardMetadata vs annotationId as mutually exclusive paths
- Any new field must be added in both places (as fingerprint demonstrated)

## Acceptance Criteria
- [ ] `FlashcardMetadata` scoped internally to parser (not exported) or eliminated
- [ ] Flashcard constructor simplified — single creation path
- [ ] No duplicate field definitions across parser and model

## Related
- [DEBT-001](DEBT-001-inconsistent-data-models.md) — overlapping type design issues
