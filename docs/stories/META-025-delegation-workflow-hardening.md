# META-025: Delegation Workflow Hardening

## Status
Proposed

## Epic
None

## Description

Three sessions of delegation (DEBT-007, BUG-002, DEBT-008, DEBT-014, DEBT-041) have
surfaced recurring friction points in the cherry-pick → close → archive workflow. These
are small but compound: each delegation requires manual worktree inspection, a separate
closure commit, and a forgotten archive step. This story collects confirmed gaps and
proposes concrete fixes.

### Gap 1: Archive not included in closure commit

Closing a story currently produces two commits: one for the refactor (cherry-picked),
one for the story status update. The archive step (`git mv story → docs/archive/stories/`)
is consistently forgotten and added as a third commit later — or not at all.

**Fix:** Add archival as a mandatory last step in the close-story checklist. Helper
script or documented step: `git mv docs/stories/<ID>-*.md docs/archive/stories/` before
creating the closure commit.

### Gap 2: Semantic logs and delegation logs not committed

Delegation produces three files:
- `docs/executions/<ID>-delegation.log` — full Codex transcript (large, raw)
- `docs/executions/semantic/<timestamp>-<branch>.md` — compact semantic summary (small, useful)

The semantic log is the valuable artifact; the raw log is reference-only. Current
workflow commits neither. The raw log probably shouldn't be committed (large, noisy).
The semantic log should be committed alongside the closure.

**Fix:** Include `docs/executions/semantic/` in the closure commit. Gitignore the raw
`*.log` files (or keep them locally untracked).

### Gap 3: Codex sometimes leaves changes staged but uncommitted

When a delegation run errors mid-execution, Codex may stage changes without committing.
The contract then fails, and the delegate script reports `run failed`. The changes are
correct but uncommitted. Current response: re-delegate (wasteful).

**Fix:** After any `run failed` result, inspect the worktree with `git -C <worktree>
status --short` and `git -C <worktree> show --stat HEAD` before concluding failure.
Staged-but-uncommitted changes are recoverable — commit manually and cherry-pick.

### Gap 4: cherry-pick requires knowing the hash; --squash is more scriptable

Cherry-picking requires knowing the exact commit hash from the worktree. `git merge
--squash <branch>` would work without a hash lookup, and handles N-commit worktrees.

**Open question:** do we ever want to preserve multiple logical commits from a single
Codex session? If not, `--squash` is strictly better. If yes, cherry-pick loop is needed.

**Fix:** Decide and document. Default to `--squash` unless the scope file explicitly
requests multi-commit preservation.

### Gap 5: Contract lint check catches pre-existing debt

`npm run lint` (prettier --check) exits 1 when ANY file has formatting issues, including
files unrelated to the delegation. A delegation that correctly fixes its scope will still
fail the contract if pre-existing lint debt exists.

**Fix:** Scope lint contract checks to the files changed, not the whole repo. Use
`npx prettier --check <changed-files>` or omit lint from contracts entirely until the
repo-wide formatting debt (DEBT-XXX) is resolved.

## Acceptance Criteria

- [ ] Close-story workflow documented with archival as mandatory step
- [ ] Semantic logs committed in closure commit; raw logs gitignored
- [ ] Post-failure worktree inspection documented as standard recovery step
- [ ] Decision made on cherry-pick vs `--squash`; documented in workflow guide
- [ ] Contract lint check scoped to changed files (or removed until lint debt resolved)

## Likely Touchpoints

- `docs/guides/workflow.md` — delegation workflow section
- `scripts/delegate-codex-task.sh` — post-run archival hook opportunity
- `.gitignore` — add `docs/executions/*.log`
- `CLAUDE.md` — session workflow notes

## Related

- [META-022](META-022-delegation-quiet-mode.md) — related delegation output improvements
- [META-024](META-024-commit-type-taxonomy-for-llm-driven-development.md) — commit taxonomy
