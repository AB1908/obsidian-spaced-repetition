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

## Related
- Tech debt item #4 from legacy `technical_debt.md`
