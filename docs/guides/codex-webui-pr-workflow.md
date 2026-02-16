# Codex Web UI PR Workflow (Experimental)

## Status
Experimental

## Goal
Enable fast PR-based review in Codex Web UI while preserving commit-quality signal and avoiding expensive multi-PR cleanup cycles.

## Non-Goal
This guide does not change Codex CLI behavior or the default local workflow in `docs/guides/workflow.md`.

## Core Model
Use two branches for each story:

1. `analysis/<story-id>-<topic>`
- Codex can commit freely here.
- Keep noisy intermediate commits for behavior analysis.
- Never merge this branch directly.

2. `pr/<story-id>-<topic>`
- Clean reviewer-facing branch.
- Contains 1-2 intentional commits max.
- Used to open and maintain the GitHub PR.

## Why This Works
- You can open a PR early for UI review without losing the signal of Codex commit grouping.
- You can still rewrite the PR branch safely with `--force-with-lease`.
- Reviewers only see a clean commit set.

## Step-by-Step

### 1) Start analysis branch
```bash
git fetch origin
git checkout main
git pull --ff-only
git checkout -b analysis/DEBT-008-source-listing
```

### 2) Let Codex iterate
Codex works normally and commits as needed on `analysis/...`.

Useful signal capture:
```bash
git log --oneline --reverse origin/main..HEAD
```

### 3) Build clean PR branch
```bash
git checkout main
git pull --ff-only
git checkout -b pr/DEBT-008-source-listing

# Cherry-pick only intentional commits from analysis branch
git cherry-pick <sha1>
git cherry-pick <sha2>  # optional; keep total at 1-2 commits
```

### 4) Open PR from `pr/...`
```bash
git push -u origin pr/DEBT-008-source-listing
gh pr create
```

### 5) If PR exists and history needs cleanup
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
