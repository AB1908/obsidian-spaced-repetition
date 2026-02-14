# DEBT-001: Inconsistent Data Models & Type Weakness

## Status
Backlog

## Description
`bookSections` array holds mixed `Heading`, `annotation`, and `paragraph` types. Methods don't always handle all types robustly (e.g., `updateAnnotation` called with a paragraph causes TypeError). The `transform()` function papers over model inconsistencies.

## Impact
Runtime TypeErrors not caught by TypeScript. Causes test failures in `api.test.ts` (the navigation filter bug tests fail because `updateAnnotationMetadata` on a paragraph hits `renderAnnotation` which expects `highlight` field).

## Acceptance Criteria
- [ ] Discriminated union or unified `BookSection` interface
- [ ] Type guards colocated with type definitions
- [ ] `updateAnnotation` robustly handles paragraph vs annotation

## Notes
The `isParagraph()` / `isAnnotation()` type guards use duck-typing (`wasIdPresent !== undefined`, `highlight !== undefined`) instead of a discriminator field. A proper discriminated union (`type: 'paragraph' | 'annotation' | 'heading'`) would eliminate all type guards and make the codebase more idiomatic TypeScript.

## Related
- Tech debt item #4 from legacy `technical_debt.md`
- [DEBT-004](DEBT-004-strategy-coupling.md) — section type handling duplication
- [STORY-012](STORY-012-drift-detection-ux.md) — drift traversal depends on isParagraph
