# DEBT-043: Add combined check command (lint + typecheck + tests)

## Status
Proposed

## Reviewed
No

## Epic
None

## Description
There is no `npm run check` or equivalent that runs lint, type checking, and tests in a single command. Agents and contributors must remember to run `npm run lint`, `tsc --noEmit`, and `npm test` separately. There is also no `tsc --noEmit` script at all — type errors are not surfaced outside of the editor.

A single deterministic pass/fail command is essential for agents to confirm their changes are safe before committing or pushing.

## Acceptance Criteria
- [ ] `package.json` includes a `"check"` script that runs `npm run lint && tsc --noEmit && npm test`
- [ ] `npm run check` exits non-zero if any step fails
- [ ] `CLAUDE.md` documents `npm run check` as the pre-commit verification command
- [ ] `pr.yml` uses `npm run check` (or equivalent steps) as the CI gate

## Likely Touchpoints
- `package.json`
- `CLAUDE.md`
- `.github/workflows/pr.yml`

## Depends on
- [DEBT-042](DEBT-042-ci-runs-tests.md)

## Related
- [DEBT-044](DEBT-044-typescript-strict-mode.md)
