# Plan: DEBT-020 NPM Migration Standardization

**Story:** `docs/stories/DEBT-020-npm-migration-standardization.md`  
**Date:** 2026-02-17  
**Objective:** Make npm the single package-manager path for local dev, CI, release, and security remediation.

## Current State Snapshot

## Package Manager Signals
- `package-lock.json` exists and is used by CI cache/install paths.
- `yarn.lock` also exists and is currently tracked.
- `package.json` scripts still call Yarn for:
  - `format`: `yarn prettier --write .`
  - `lint`: `yarn prettier --check .`

## Workflow/Automation Signals
- `.github/workflows/pr.yml` uses `npm ci`.
- `.github/workflows/codeql-analysis.yml` uses npm cache keyed by `package-lock.json`.
- `.github/workflows/release.yml` uses `npm ci || npm install --legacy-peer-deps` and npm release scripts.
- `.husky/pre-commit` runs `npm test`.

## Documentation Signals
- Most active docs now use npm, but legacy references to `yarn test ...` still exist in older spike docs.

## Migration Strategy (Phased)

## Phase 1: Script Normalization (No Lockfile Removal Yet)
1. Update `package.json` scripts to call local binaries directly:
   - `format`: `prettier --write .`
   - `lint`: `prettier --check .`
2. Verify command behavior from npm scripts.
3. Keep both lockfiles temporarily to isolate script-risk from dependency-resolution-risk.

### Exit Criteria
- `npm run lint` and `npm run format` work without Yarn installed.

## Phase 2: Lockfile Canonicalization
1. Choose npm as canonical lockfile (`package-lock.json`).
2. Remove `yarn.lock`.
3. Re-run install with npm to ensure lockfile is current:
   - `npm ci` (or `npm install` if lock regeneration is required).
4. Validate no unexpected dependency breakages in tests/build.

### Exit Criteria
- `yarn.lock` deleted.
- `npm test` and `npm run build` remain green.

## Phase 3: CI and Release Hardening
1. Keep CI and release workflows npm-only.
2. Decide whether fallback install (`npm ci || npm install --legacy-peer-deps`) is still needed.
3. Ensure cache keys consistently use `package-lock.json`.

### Exit Criteria
- PR workflow, release prep, and release publish jobs pass using npm paths.

## Phase 4: Documentation and Drift Cleanup
1. Replace active Yarn command references in maintained docs.
2. Mark archived docs as historical if they retain old commands.
3. Add one short “package manager policy” note in a canonical guide (release playbook or contributor guide):
   - npm is source of truth
   - do not commit `yarn.lock`

### Exit Criteria
- No active onboarding/release doc instructs Yarn usage.

## Breakage Matrix and Prepared Mitigations

| Area | What can break | Detection | Mitigation |
|---|---|---|---|
| Local lint/format | scripts fail when Yarn unavailable | `npm run lint`, `npm run format` | rewrite scripts to binary invocation |
| Dependency graph | subtle transitive version drift | `npm test`, build, targeted runtime smoke | migrate lockfile in isolated commit; review diff |
| CI install | fallback path hides deterministic failures | workflow logs | prefer strict `npm ci` once stable |
| Release prep | tag/release run fails due env/tool mismatch | release workflow + local dry-run | keep release playbook checks; run local script before tagging |
| Dependabot | mixed lockfiles create noisy/ambiguous updates | Dependabot PR patterns | single lockfile policy (npm only) |

## Validation Plan

## Mandatory
- `npm ci`
- `npm test`
- `OBSIDIAN_PLUGIN_DIR=. npm run build`
- `npm run lint`

## Recommended
- Open plugin in test vault and verify core import/review flow.
- Run one release dry-run command path without pushing:
  - `npm run release:prepare -- <test-version>`

## Commit Strategy
1. `chore(scripts): remove yarn usage from npm scripts`
2. `chore(deps): remove yarn.lock and standardize npm lockfile workflow`
3. `docs: update package manager guidance to npm-only`

This split keeps rollback and root-cause analysis simple.

## Rollback Plan
1. If script changes fail: revert script commit only.
2. If lockfile migration causes instability: restore `yarn.lock` temporarily and re-open as phased follow-up.
3. If CI release paths fail: keep npm local standardization, defer workflow hardening changes behind a separate debt item.

## Notes
- This plan intentionally avoids bundling dependency major upgrades with package-manager migration.
- Handle package-manager migration first; do security/toolchain majors in controlled follow-up batches.
