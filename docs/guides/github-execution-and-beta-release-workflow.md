# GitHub Execution and Beta Release Workflow

## Status
Active

## Goal
Make `docs/stories` the approved intent contract, move execution/review to GitHub PRs, and use GitHub prereleases for BRAT-based beta testing.

## Principles
- Stories define scope and intent before code starts.
- Agents implement; human reviews and merges.
- PRs are the only code review surface.
- Release tags are explicit and machine-readable.

## 1) Story Approval Gate (Required Before Coding)
An agent may not start implementation until the story is explicitly approved.

Required story fields before status can be set to `Ready`:
- `Status: Ready`
- clear problem statement
- explicit acceptance criteria
- explicit `Allowed files` list
- required test commands
- dependencies/blockers

Approval flow:
1. Draft story (can be LLM-assisted).
2. Add investigation notes (SPIKE/session notes) if behavior is unclear.
3. Human review and scope edits.
4. Human approval changes status to `Ready`.
5. Agent execution may begin.

## 2) GitHub Execution Flow
1. Create/update GitHub Issue linked to story ID (`BUG-005`, `SPIKE-002`, etc.).
2. Assign branch/worktree from the approved plan.
3. Agent implements and opens PR to `main`.
4. Human reviews PR against the approved story contract.
5. Merge only when acceptance criteria and test evidence are satisfied.

Default operating rule:
- No "implementation by chat thread." All implementation feedback should live in the PR and map to acceptance criteria.

## 3) PR Contract (Required)
Every PR must include:
- linked story/issue ID
- scope statement
- list of changed files
- statement that changed files are within `Allowed files`
- test commands run + result summary
- risk/rollback note (for non-trivial behavior changes)

Reject PR when:
- it changes files outside allowed scope without prior approval
- required tests are missing or failing
- acceptance criteria are only partially met

## 4) Merge and Branch Rules
- `main` is protected and merge-only via reviewed PR.
- Require CI to pass before merge.
- Require branch to be up to date with `main` before merge when conflicts are likely.
- Prefer squash merge for single-story changes unless preserving commit boundaries is important.
- Release automation expectations:
  - PR merge is the release gate for default path.
  - Enable workflow write permissions to repo contents for release automation.
  - Allow GitHub Actions bot to push release commit/tag to `main` if branch protection requires explicit allowances.

## 5) Beta Tagging and Releases (BRAT-Oriented)
Historical tags in this repo include pre-rewrite formats and should be treated as legacy.

Adopt a clean forward policy:
- Stable tags: `X.Y.Z` (example: `0.3.0`)
- Beta tags: `X.Y.Z-beta.N` (example: `0.3.1-beta.1`)

Release intent:
- Beta tags publish GitHub **prereleases** for in-app BRAT testing.
- Stable tags publish normal GitHub releases.

Release artifacts must include:
- `main.js`
- `manifest.json`
- `styles.css`

Execution details:
- Use `docs/guides/release-playbook.md` for the exact, agent-executable tagging/version-bump procedure.
- PR labels select release type deterministically (`release:major|minor|patch|beta|skip`).
- No release label means `patch`.
- `release:beta` produces prerelease tags (`X.Y.Z-beta.N`) and GitHub prereleases.
- Release prep runs are serialized to avoid overlapping version bumps after close-together merges.
- Automation ignores bot-authored release PR metadata (`chore(release): ...`) to prevent recursion.
- Stable releases enforce `versions.json[version] == manifest.minAppVersion`.
- Beta releases enforce no `versions.json` entry for beta tags by default.
- Release prep runs `npm test`; automation then checks out the release tag commit and publishes assets in the same PR-merge workflow run.
- Emergency/manual tag pushes keep a tag-triggered publish fallback.

## 6) BRAT Compatibility Notes
- BRAT installs from GitHub release assets.
- Prerelease tagging enables a clear beta channel without contaminating stable updates.
- Keep version progression monotonic so testers can upgrade cleanly.

Reference:
- https://tfthacker.com/brat-developers#BRAT+Guide+for+Plugin+Developers

## 7) Roles
- Human (you): owns intent, scope approval, prioritization, final merge.
- Agent: owns implementation inside approved boundaries and PR preparation.

## 8) Rollout Plan
Phase 1:
- Adopt this workflow immediately for new stories.
- Keep emergency manual release path documented and runnable.

Phase 2:
- Keep release automation on PR merge gate and enforce `tag == manifest.json.version`.
- Validate BRAT install/update from beta release assets.

Phase 3:
- Add PR template and issue template aligned with this contract.

## 9) Mobile-Friendly Operations Path
Use this when shipping from mobile-first or low-local-tooling environments:

1. Author story and get approval in `docs/stories`.
2. Agent implements in worktree/branch and opens PR.
3. Human reviews and merges PR to `main`.
4. GitHub Actions performs release prep, commit, tag, and release publishing.
5. Tester installs from BRAT (prerelease for beta tags, stable release otherwise).
6. If automation is unavailable, use emergency manual path in `docs/guides/release-playbook.md`.
