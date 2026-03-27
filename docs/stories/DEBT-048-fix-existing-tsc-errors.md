# DEBT-048: Fix Existing TypeScript Errors

## Status
Ready

## Reviewed
No

## Epic
None

## Description
`tsc --noEmit` reports 107 errors across 63 files under the current config (`noImplicitAny: true`, `strictNullChecks: true`). These are real type gaps — not strict-mode additions — that have accumulated during the domain model refactor. VS Code surfaces them as red squiggly lines but no CI gate blocks them.

Primary error clusters:

| File | Errors |
|------|--------|
| `tests/api.test.ts` | 17 |
| `src/ui/routes/routes.tsx` | 14 |
| `src/data/models/flashcard.ts` | 7 |
| `src/ui/components/card-creation.tsx` | 6 |
| `tests/routes/root-title.test.tsx` | 5 |
| `tests/root.test.tsx` | 4 |
| `src/ui/routes/books/card/edit-card.tsx` | 4 |
| `src/application/import-api.ts` | 4 |
| other files | ~46 |

Common error patterns:
- `Object is possibly 'null'` — unguarded nullable access
- `Type 'null' is not assignable to type 'string'` — missing null narrowing
- Type union mismatches from domain model refactor (`annotation | paragraph`, `BookMetadataSection`)
- `annotation[]` passed where `MoonReaderAnnotation[]` expected

## Acceptance Criteria
- [ ] `tsc --noEmit` exits 0 with no errors
- [ ] No errors suppressed with `// @ts-ignore` or `// @ts-expect-error` unless pre-existing
- [ ] `npm test` still passes after all fixes

## Notes
Do not enable `strict: true` as part of this story — that is DEBT-044. Fix only what the current config already flags.

This may surface latent bugs (especially around null handling). Fixes should be correct, not just type-satisfying casts.

## Likely Touchpoints
- `src/application/` — null guards, type narrowing
- `src/data/models/flashcard.ts` — null/undefined returns
- `src/data/models/annotations-note/annotation-persistence.ts` — union type mismatches
- `src/ui/routes/routes.tsx` — route type issues
- `tests/` — test fixture type gaps

## Depends on
- None
