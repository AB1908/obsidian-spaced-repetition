# STORY-014: PR-Gated Automated Release Pipeline

## Status
Done

## Epic
None

## Branch
feat/pr-gated-release-automation

## Depends on
- `release.yml` stable build/upload path fix (completed in `0.5.1`)

## User Story
As a maintainer, I want release creation to be gated by PR merge approval, so that manifest/version bumps, tags, and GitHub releases are deterministic and auditable without local manual release steps.

## Context
Current release flow is tag-driven and mostly manual:
- maintainer bumps `manifest.json` and `versions.json`
- maintainer commits, tags, and pushes
- `release.yml` builds and uploads assets

Desired flow:
- merge approved PR to `main`
- automation bumps release version files
- automation creates tag and release
- BRAT users consume release assets as today

Implemented baseline (2026-02-16):
- deterministic local prep script: `scripts/prepare-release.sh`
- npm wrapper: `npm run release:prepare -- <version>`
- canonical instructions in `docs/guides/release-playbook.md`

## Acceptance Criteria
- [ ] A workflow creates stable releases from merged PRs without manual local tagging.
- [ ] Version source of truth is deterministic and documented (no dual conflicting bump mechanisms).
- [ ] `manifest.json.version`, `versions.json`, Git tag, and release name are always identical.
- [ ] Beta release path is explicitly supported or explicitly deferred with documented rationale.
- [ ] Existing manual emergency path remains documented (`docs/guides/release-playbook.md`).
- [ ] End-to-end dry run in a test branch/repo validates created assets (`main.js`, `manifest.json`, `styles.css`, zip).

## Allowed Files
- `.github/workflows/*`
- `scripts/*`
- `package.json`
- `docs/guides/release-playbook.md`
- `docs/guides/github-execution-and-beta-release-workflow.md`

## Required Test Commands
- `npm test`
- `OBSIDIAN_PLUGIN_DIR=. npm run build`

## Tasks
- [x] Add deterministic local release-prep baseline (script + docs).
- [ ] Choose bump strategy (`changesets`, `standard-version`, or custom script + labels).
- [ ] Implement merge-trigger workflow for release prep, tagging, and release creation.
- [ ] Add loop-prevention strategy so automation commits/tags do not recurse unexpectedly.
- [ ] Add branch protection expectations to docs (PR approval as release gate).
- [ ] Document mobile-friendly operational path (agentic session -> PR -> merge -> release).

## Related
- `docs/guides/release-playbook.md`
- `docs/guides/github-execution-and-beta-release-workflow.md`

## Session Notes
### 2026-02-17
- Lane B started in worktree `.worktrees/lane-b-release`.
- Focus is release automation, deterministic version/tag flow, and prerelease behavior.
