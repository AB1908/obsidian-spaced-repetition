# Plan: DEBT-041 + DEBT-042 — Environment Setup and CI

## Current State

- `pr.yml` triggers on PRs to `master` (not `main`), runs `npm ci` + lint only — no test step
- No `scripts/setup.sh` exists
- `AGENTS.md` is thin; `CLAUDE.md` has no setup section

## DEBT-041: scripts/setup.sh

Create `scripts/setup.sh`:
```bash
#!/usr/bin/env bash
set -euo pipefail
npm ci
if [[ ! -x node_modules/.bin/jest ]]; then
  echo "setup.sh: jest not found after npm ci" >&2
  exit 1
fi
echo "Environment ready. Run: npm test"
```

Reference in docs:
- `CLAUDE.md` — add one-liner under Essential Commands: `scripts/setup.sh   # Fresh-clone setup: runs npm ci and validates jest`
- `AGENTS.md` — add "Setup" section pointing to `scripts/setup.sh` before running `npm test`

## DEBT-042: CI test step

Fix `pr.yml`:
1. `branches: [master]` → `branches: [main]`
2. Add Typecheck and Test steps after Lint (once DEBT-043 `typecheck` script exists)

```yaml
- name: Typecheck
  run: npm run typecheck

- name: Test
  run: npm test
```

## Open Questions

1. Should the CI test step use `npm run check` (waiting on DEBT-043) or `npm test` directly?
   Recommendation: wire `npm test` now, update to `npm run check` when DEBT-043 lands.
2. Should `npm test` in CI add `--forceExit` or a timeout?

## Commit Structure

1. `chore: add setup script for fresh-clone environment validation`
2. `chore: fix pr.yml branch target and add test step`
3. `docs: reference setup script in CLAUDE.md and AGENTS.md`
