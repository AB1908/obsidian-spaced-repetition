# DEBT-042: CI should run tests on pull requests

## Status
Done

## Reviewed
No

## Epic
None

## Description
`.github/workflows/pr.yml` only runs `npm run lint`. Tests are never executed in CI, so a PR with broken tests can merge undetected. An agent that pushes a fix has no automated confirmation that the test suite passes.

The CI file ends after the lint step — there is no `npm test` step.

## Acceptance Criteria
- [ ] `pr.yml` includes a `Test` step that runs `npm test`
- [ ] A PR with a failing test is blocked from merging by CI

## Likely Touchpoints
- `.github/workflows/pr.yml`

## Depends on
- [DEBT-041](DEBT-041-scripted-environment-setup.md) — tests must be installable via `npm ci` in CI

## Related
- [DEBT-043](DEBT-043-combined-check-command.md)
