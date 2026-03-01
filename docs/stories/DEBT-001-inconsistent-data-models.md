# DEBT-001: Inconsistent Data Models & Type Weakness

## Status
Backlog

## Description
`bookSections` arrays (of type `BookMetadataSections`) hold mixed `Heading`, `annotation`, and `paragraph` types. The type guards in `src/data/models/sections/guards.ts` now use a proper `type` discriminator field (`section.type === "heading"`, `"annotation"`, `"paragraph"`) rather than duck-typing — this is a partial improvement. However, the underlying types are still defined as separate interfaces with no shared base type or discriminated union enforced at the type level.

The `paragraph` interface (in `src/data/models/paragraphs.ts`) still carries `wasIdPresent`, which is a state flag with no counterpart on `annotation` or `Heading`. The `toAnnotationLike()` transform in `annotation-transform.ts` exists specifically to paper over paragraph-vs-annotation differences when callers need a uniform `annotation`-shaped value.

`updateAnnotation` in `AnnotationsNote.ts` calls `updateAnnotationOnDisk`, which passes through to `renderAnnotation` — this will throw at runtime if called with a `paragraph` or `Heading` id instead of an `annotation` id, since `renderAnnotation` expects an `annotation`-shaped object. The type system does not prevent this: the `annotationId` parameter is typed as `string`, not as a key guaranteed to belong to an `annotation`.

The `frontbook` / `SourceRecord` type alias in `annotations-note/types.ts` acknowledges source-neutral naming is incomplete.

## Impact
Runtime TypeErrors not caught by TypeScript if `updateAnnotation` is called with a non-annotation block ID. `toAnnotationLike()` in `annotation-transform.ts` is a workaround that adds complexity to callers. Any code iterating `bookSections` must re-check the type discriminator manually rather than relying on the type system.

## Acceptance Criteria
- [ ] Discriminated union or unified `BookSection` interface enforced at the type level
- [ ] Type guards remain colocated with type definitions in `src/data/models/sections/guards.ts`
- [ ] `updateAnnotation` robustly handles or rejects non-annotation input at the type level
- [ ] `toAnnotationLike()` usage eliminated or justified

## Notes
The guards (`isHeading`, `isAnnotation`, `isParagraph`, `isAnnotationOrParagraph`) in `src/data/models/sections/guards.ts` are already using the `type` discriminator field — the duck-typing issue described in the original story has been partially addressed. The remaining gap is that the three types (`Heading`, `annotation`, `paragraph`) are not collected into a single discriminated union type, so the compiler cannot exhaustively check switch statements or guarantee coverage.

## Likely Touchpoints
- `src/data/models/sections/types.ts` — `BookMetadataSection`, `SectionNode` type aliases
- `src/data/models/sections/guards.ts` — type guard implementations
- `src/data/models/annotations.ts` — `annotation` interface definition
- `src/data/models/paragraphs.ts` — `paragraph` interface, `wasIdPresent` field
- `src/data/models/annotations-note/types.ts` — `frontbook`, `SourceRecord` aliases
- `src/data/models/annotations-note/annotation-transform.ts` — `toAnnotationLike()` workaround
- `src/data/models/annotations-note/annotation-persistence.ts` — `updateAnnotationOnDisk` (calls `renderAnnotation`)
- `src/data/models/annotations-note/AnnotationsNote.ts` — `updateAnnotation`, `annotations()`, `getAnnotation()`

## Plan
[Source Model Seam Repair — PR 1](../plans/DEBT-011-source-model-seam-repair.md#pr-1-discriminated-union-for-sections-debt-001)

## Related
- [DEBT-013](DEBT-013-source-polymorphism.md) — paragraph vs annotation divergence also affects source polymorphism
- [STORY-012](STORY-012-drift-detection-ux.md) — drift traversal depends on isParagraph
