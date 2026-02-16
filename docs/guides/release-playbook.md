# Release Playbook (Agent-Executable)

## Purpose
Define one release process that any coding agent can execute (Codex, Claude Code, Gemini CLI) for this repository.

## Canonical Rules
1. Release workflow trigger is a pushed Git tag (`.github/workflows/release.yml`).
2. Tag version must match the released `manifest.json` version exactly.
3. Do not use a `v` prefix in tags. Use `X.Y.Z` or `X.Y.Z-beta.N`.
4. Tag the commit that contains the version bump.

## Why These Rules Exist
- Obsidian sample plugin release guidance requires:
  - `manifest.json` version bump
  - `versions.json` update
  - tag equal to release version (no `v`)
- Obsidian community plugin install/update flow expects:
  - root `manifest.json` for latest version discovery
  - release tag identical to `manifest.json.version`
- BRAT developer guidance expects release artifacts and matching version/tag/name.

## Versioning Policy in This Repo
- Stable release tag: `X.Y.Z`
- Beta release tag: `X.Y.Z-beta.N`
- `manifest.json.version`: always equals the tag being released
- `versions.json`:
  - Stable release: add/update `"X.Y.Z": "<minAppVersion from manifest.json>"`
  - Beta release: do not add beta entries unless explicitly requested

## Agent Procedure
1. Confirm clean working tree for release files.
2. Choose target version (`TARGET_VERSION`), e.g. `0.3.0` or `0.3.1-beta.1`.
3. Update `manifest.json`:
   - set `version` to `TARGET_VERSION`
   - keep `minAppVersion` intentional
4. If stable release, update `versions.json` with:
   - key: `TARGET_VERSION`
   - value: current `manifest.json.minAppVersion`
5. Run verification:
   - `npm run build`
   - optional: `npm test`
6. Commit version files:
   - `git add manifest.json versions.json` (or only `manifest.json` for beta)
   - `git commit -m "chore(release): <TARGET_VERSION>"`
7. Tag that commit:
   - `git tag -a <TARGET_VERSION> -m "<TARGET_VERSION>"`
8. Push commit and tag:
   - `git push origin main`
   - `git push origin <TARGET_VERSION>`
9. Validate GitHub Actions `release.yml` run and release assets:
   - `main.js`, `manifest.json`, `styles.css`, zip asset

## Guardrails
- Never create a tag before committing version bumps.
- Never push a tag that differs from `manifest.json.version`.
- Avoid `v` prefix tags because Obsidian expects exact version match.
- If release fails, fix on a new commit and use a new version tag (do not retag published releases).

## Optional Next Step
Changelog generation can be added later as a pre-tag step, but it is not required for release correctness.
