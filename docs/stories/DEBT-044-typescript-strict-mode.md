# DEBT-044: Enable TypeScript strict mode

## Status
Proposed

## Reviewed
No

## Epic
None

## Description
`tsconfig.json` has `noImplicitAny: true` and `strictNullChecks: true` but not `"strict": true`. Enabling `strict` also activates `strictFunctionTypes`, `strictBindCallApply`, and `strictPropertyInitialization`, which catch a meaningful class of interface violations.

`GEMINI.md` explicitly notes this as a known gap with a task to "inspect tsc output and create a roadmap to fix small bugs detected by tsc."

Without strict mode, `tsc --noEmit` is a weaker signal — an agent cannot rely on it to catch all interface violations.

## Acceptance Criteria
- [ ] `tsconfig.json` has `"strict": true` (replaces individual flags)
- [ ] `tsc --noEmit` passes with strict mode enabled
- [ ] Any errors introduced by strict mode are fixed (not suppressed with `// @ts-ignore`)

## Notes
This is likely a multi-session effort. Recommended approach: enable strict, run `tsc --noEmit`, and triage the errors into a DEBT sub-list before fixing. Do not suppress with `@ts-ignore`.

## Likely Touchpoints
- `tsconfig.json`
- Various `src/` files (count of errors TBD)

## Depends on
- [DEBT-043](DEBT-043-combined-check-command.md) — `tsc --noEmit` should be part of the check command before this is worth enforcing
