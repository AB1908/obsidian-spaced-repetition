# META-011: NPM Migration Standardization (Remove Yarn Drift)

## Status
Backlog

## Epic
None

## Branch
chore/npm-migration-standardization

## Depends on
- DEBT-015 (dependency/security remediation baseline)

## Description
The repository currently mixes package-manager signals:
- `package-lock.json` and `yarn.lock` are both tracked.
- `package.json` scripts still call `yarn` for `lint` and `format`.
- CI/release workflows already install with `npm ci`.

This dual-manager state creates drift risk (different resolved trees, confusion about source-of-truth lockfile, inconsistent local behavior). We should complete migration to npm as the canonical package manager and remove Yarn-specific paths from active workflows.

## Scope
- Standardize local scripts and developer commands on npm.
- Keep CI/release deterministic with npm lockfile only.
- Remove Yarn lockfile from active dependency management.
- Update docs and stories that still instruct Yarn commands.

## Out of Scope
- Toolchain major upgrades unrelated to package-manager alignment.
- Introducing pnpm or other package managers.
- Reworking release architecture beyond package-manager consistency.

## Functionalities Potentially Affected
1. Local dev command behavior (`npm run lint`, `npm run format`, `npm test`).
2. CI dependency caching and install determinism (`package-lock.json` path).
3. Release preparation and publish jobs (`npm ci`, `npm run release:prepare`).
4. Dependabot lockfile behavior and security update PR shape.
5. Historical docs/workflows/scripts that still reference Yarn.

## Expected Breakages / Risks
1. Dependency graph changes when removing `yarn.lock` (resolved transitive versions may shift).
2. Developer muscle-memory failures (`yarn test`, `yarn prettier`) during transition.
3. CI cache churn after lockfile refresh.
4. Documentation drift if old Yarn commands remain in archived-but-used guides.

## Acceptance Criteria
- [ ] `package.json` scripts do not invoke `yarn`.
- [ ] `yarn.lock` is removed from repository root.
- [ ] CI and release workflows pass using npm-only install strategy.
- [ ] Core checks pass locally after migration:
  - `npm test`
  - `OBSIDIAN_PLUGIN_DIR=. npm run build`
  - `npm run lint`
  - `npm run format -- --check` (or equivalent no-write validation)
- [ ] Documentation no longer instructs active Yarn-based commands.
- [ ] Dependabot behavior is documented with npm lockfile as source of truth.

## Required Test Commands
- `npm ci`
- `npm test`
- `OBSIDIAN_PLUGIN_DIR=. npm run build`
- `npm run lint`
- `npm run format`

## Related Files
- `package.json`
- `package-lock.json`
- `yarn.lock`
- `.github/workflows/pr.yml`
- `.github/workflows/release.yml`
- `.github/workflows/codeql-analysis.yml`
- `docs/guides/release-playbook.md`
- `docs/stories/DEBT-015-dependabot-vulnerability-remediation.md`
- `docs/stories/SPIKE-002-post-move-and-section-navigation-hardening-plan.md`

## Plan Link
- `docs/plans/DEBT-020-npm-migration-standardization-plan.md`
