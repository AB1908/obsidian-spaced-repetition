# Codex Web UI PR Workflow (Experimental)

## Status
Experimental

## Goal
Enable fast implementation in Codex Web UI while preserving commit-quality signal and keeping Git/GitHub authority on a trusted local machine.

## Non-Goal
This guide does not change Codex CLI behavior or the default local workflow in `docs/guides/workflow.md`.

## Trust Boundary
- Codex Web UI environment is execution/drafting only.
- Local machine is source-of-truth for push, rebase/squash, and PR operations.
- Do not require `gh`, tokens, or GitHub API access in Codex Web UI.

## Core Model
Use two branches for each story:

1. `analysis/<story-id>-<topic>`
- Codex can commit freely here.
- Keep noisy intermediate commits for behavior analysis.
- Never merge this branch directly.

2. `pr/<story-id>-<topic>`
- Clean reviewer-facing branch.
- Contains 1-2 intentional commits max.
- Opened and maintained from local machine only.

## Why This Works
- You preserve Codex behavior signal without forcing noisy history into reviewer-facing branches.
- You can still rewrite PR branch history safely with `--force-with-lease` from local.
- Reviewers only see a clean commit set.

## Step-by-Step

### 1) Start analysis branch (local)
```bash
git fetch origin
git checkout main
git pull --ff-only
git checkout -b analysis/DEBT-008-source-listing
```

### 2) Let Codex Web iterate (draft/execution lane)
Codex Web works on the task and generates:
- code changes
- test notes
- session report (`docs/process/sessions/...`)

Useful signal capture:
```bash
git log --oneline --reverse origin/main..HEAD
```

### 3) Import Web output to local branch
Use whichever transfer method is available (patch file, copied diff, or synced files), then commit locally.

### 4) Build clean PR branch (local)
```bash
git checkout main
git pull --ff-only
git checkout -b pr/DEBT-008-source-listing

# Cherry-pick only intentional commits from analysis branch
git cherry-pick <sha1>
git cherry-pick <sha2>  # optional; keep total at 1-2 commits
```

### 5) Push and open PR from local machine
```bash
git push -u origin pr/DEBT-008-source-listing
```

Open/update PR in GitHub UI (or `gh` locally if preferred).

### 6) If PR exists and history needs cleanup
```bash
# On pr/... branch
git log --oneline origin/main..HEAD

# Rewrite locally (example)
git reset --soft origin/main
git commit -m "refactor(api): rename source listing API and dedupe confirmation policy [DEBT-008]"

# Update remote safely
git push --force-with-lease
```

## Review Strategy (Mobile + Desktop)
- Mobile: triage, high-level decisions, scope checks, PR body quality.
- Desktop: line-by-line code review and final approval.
- If mobile-only session is required, review commit-by-commit instead of full `Files changed` at once.

## PR Body Contract
Every PR should include:
- Story links (for example `DEBT-008`, `DEBT-014`)
- Scope and changed files
- Reviewer-feedback resolutions
- Test commands run and outcomes
- Risk and rollback plan

## Test Gate
Run in order before merge:
```bash
yarn test -- tests/api.test.ts tests/api.clippings.test.ts
yarn test
```

## Fallback If Force-Push Is Blocked
If branch policy forbids force-push:
1. Keep current PR open.
2. Add one final "history cleanup" commit that consolidates behavior without rebasing.
3. Document the compromise in PR body under `History Notes`.
4. For next story, use the two-branch model from the start.

## No-Secrets Mode (Recommended)
- Do not configure GitHub secrets/tokens in Codex Web UI.
- Keep all PR and branch governance actions local.
- Treat Web environment as reproducible draft tooling, not release authority.

## Merge Recommendation
For clean commit history with preserved intent:
- Prefer **Rebase and merge** for `pr/...` branches.
- Avoid squash when commit boundaries contain useful debugging or behavior signal.

## Quick Checklist
- [ ] Analysis branch captured Codex iteration signal
- [ ] PR branch reduced to 1-2 intentional commits
- [ ] PR body rewritten (not placeholder)
- [ ] Targeted and full tests executed
- [ ] Merge strategy selected intentionally
