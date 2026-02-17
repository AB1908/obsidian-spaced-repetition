# Release Playbook (Agent-Executable)

## Purpose
Define one release process that any coding agent can execute (Codex, Claude Code, Gemini CLI) for this repository.

## Canonical Rules
1. Default release trigger is an approved PR merge to `main` (`.github/workflows/release.yml`).
2. Automation creates exactly one release commit and one matching tag for each release run.
3. Tag version must match released `manifest.json.version` exactly.
4. Do not use a `v` prefix in tags. Use `X.Y.Z` or `X.Y.Z-beta.N`.
5. Emergency/manual tag flow remains allowed when GitHub automation is unavailable.

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

## Default Path: PR-Gated Automated Release
1. Merge reviewed PR to `main` (branch protection is the release gate).
2. Optional release labels on PR (exactly one):
   - `release:major`
   - `release:minor`
   - `release:patch` (default when no release label is present)
   - `release:beta`
   - `release:skip` (no release commit or tag)
3. Workflow serializes release-prep runs (`concurrency`) to avoid overlapping bumps.
4. Workflow computes next version deterministically from `manifest.json.version`.
5. Workflow runs `npm test` before release prep.
6. Workflow runs `npm run release:prepare -- <NEXT_VERSION>`.
7. Workflow validates invariants:
   - `manifest.json.version == <NEXT_VERSION>`
   - stable only: `versions.json[<NEXT_VERSION>] == manifest.minAppVersion`
   - beta only: `versions.json` does not include `<NEXT_VERSION>` unless explicitly requested
8. Workflow commits release files to `main`, creates matching tag, and pushes commit/tag atomically.
9. In the same workflow run, automation checks out the new tag commit and publishes release assets: `main.js`, `manifest.json`, `styles.css`, and zip.
10. Emergency/manual pushed tags still publish via the tag-triggered path.

## Version Bump Semantics
- `patch`: `X.Y.Z` -> `X.Y.(Z+1)`, or finalize beta `X.Y.Z-beta.N` -> `X.Y.Z`
- `minor`: `X.Y.Z` -> `X.(Y+1).0`
- `major`: `X.Y.Z` -> `(X+1).0.0`
- `beta`:
  - stable -> next patch beta (`X.Y.Z` -> `X.Y.(Z+1)-beta.1`)
  - beta -> increment beta number (`X.Y.Z-beta.N` -> `X.Y.Z-beta.(N+1)`)

Beta tags are published as GitHub prereleases automatically.

## Emergency Manual Path (Fallback)
Use only when GitHub release automation is unavailable or blocked.

1. Confirm clean working tree for release files.
2. Choose target version (`TARGET_VERSION`), e.g. `0.6.0` or `0.6.1-beta.1`.
3. Run deterministic prep script:
   - `npm run release:prepare -- <TARGET_VERSION>`
4. Run verification:
   - `npm test`
   - `OBSIDIAN_PLUGIN_DIR=. npm run build`
5. Commit version files:
   - `git add manifest.json versions.json` (or only `manifest.json` for beta)
   - `git commit -m "chore(release): <TARGET_VERSION>"`
6. Tag that commit:
   - `git tag -a <TARGET_VERSION> -m "<TARGET_VERSION>"`
7. Push commit and tag:
   - `git push origin main`
   - `git push origin <TARGET_VERSION>`
8. Validate GitHub Actions `release.yml` run and release assets.

## Guardrails
- Never create/push a tag that differs from `manifest.json.version`.
- Never create a release tag before the matching version bump commit exists.
- For stable tags, ensure `versions.json[<tag>]` equals `manifest.minAppVersion`.
- For beta tags, ensure no `versions.json` beta mapping is introduced by default.
- Avoid `v` prefix tags because Obsidian expects exact version match.
- Ignore automation-originated PRs/titles (for example `chore(release): ...`) to prevent release recursion.
- If release fails, fix on a new commit and use a new version tag (do not retag published releases).
- For local validation, run build with one-off override (`OBSIDIAN_PLUGIN_DIR=.`) to avoid writing outside the repo.
- Keep exactly one release label per PR (`release:*`) to avoid ambiguous bumps.

## Optional Next Step
Changelog generation can be added later as a pre-tag step, but it is not required for release correctness.
