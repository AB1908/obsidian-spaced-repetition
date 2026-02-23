# DEBT-037: Worktree Build Artifact Cleanup and Build Gate Without Output

## Status
Backlog

## Description

When Codex runs inside a worktree and executes a production build (`npm run build`), it
produces `main.js` in the worktree root. This file is:
- Not gitignored (it lives outside the standard ignore rules for the main working tree)
- Picked up by `git worktree remove` as a "modified or untracked file", blocking clean removal
- Not useful to review (it's a bundle artifact, not source)

Two related improvements:

### 1. Auto-clean build artifacts on worktree removal

Options:
- Add `main.js` / `*.js.map` to a worktree-local `.gitignore` (generated during delegation setup)
- Add a post-delegation hook in `delegate-codex-task.sh` that removes `main.js` before
  calling `git worktree remove`
- Use `git worktree remove --force` only when the only untracked files are known build artifacts

### 2. Build verification without artifact generation

The delegation contract checks that `npm run build` exits 0. This generates `main.js` as a
side effect. A faster, artifact-free alternative:

```bash
npx tsc --noEmit   # type-check only, no output files
```

This is faster and produces no files to clean up. However it does not verify esbuild bundling.
Evaluate whether type-check-only is sufficient for the delegation gate, or whether a build
followed by artifact cleanup is preferred.

## Acceptance Criteria
- [ ] Worktree cleanup (`git worktree remove`) succeeds without `--force` after a Codex run
      that builds the project
- [ ] Either: build artifacts are auto-removed, OR: build check uses `tsc --noEmit` and
      does not produce artifacts
- [ ] Decision between the two approaches is documented here

## Likely Touchpoints
- `scripts/delegate-codex-task.sh` — worktree setup / teardown
- `scripts/safe-merge.sh` — worktree remove step (if added)
- Delegation plan template — build verification gate instruction

## Related
- `docs/executions/` — raw logs accumulate `main.js` noise during reviews
