# DEBT-041: Add scripted environment setup

## Status
Proposed

## Reviewed
No

## Epic
None

## Description
`npm test` fails in a fresh clone because `node_modules` is not installed and there is no `setup.sh` or equivalent to guide an agent or contributor from `git clone` to a working dev environment. During the agent readiness evaluation, `npm test` exited with `jest: not found`.

Without a setup script, any automated agent that clones the repo and immediately runs `npm test` will get a false failure with no clear recovery path.

## Acceptance Criteria
- [ ] A `scripts/setup.sh` exists that runs `npm ci` and validates `node_modules/.bin/jest` is present
- [ ] Running `scripts/setup.sh` on a fresh clone produces a working `npm test` invocation
- [ ] The script is referenced in `CLAUDE.md` and `AGENTS.md` under setup instructions

## Likely Touchpoints
- `scripts/setup.sh` (new)
- `CLAUDE.md`
- `AGENTS.md`

## Related
- [DEBT-042](DEBT-042-ci-runs-tests.md)
- [DEBT-043](DEBT-043-combined-check-command.md)
