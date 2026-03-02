# Scratch — observations and deferred thoughts

Append-only. Review at session start. Promote to story or delete when actioned.

---

2026-03-01: Delegation workflow gaps observed (DEBT-008/014/041 run):
- Codex sometimes leaves changes STAGED but uncommitted when it errors mid-run.
  Always inspect worktree with `git status` before concluding failure. Changes may
  be recoverable — just commit manually then cherry-pick.
- Story archive should happen IN THE SAME COMMIT as the story closure, not as a
  separate follow-up. The cherry-pick/close workflow needs a final step: move Done
  story to docs/archive/stories/ before committing the closure message.
- Workflow rediscovery: grep scratch.md for keywords, or `git log --oneline -- docs/scratch.md`
  to find which session added an observation. Cross-reference with semantic logs in
  docs/executions/semantic/ for full delegation context.
- scratch.md itself is a weak signal store — promote items to stories or guides once
  an observation is confirmed across >1 session. Delete when actioned.

2026-03-01: Test contract gotcha — absence checks need negation.
- `grep -rn "foo" src/` exits 0 when it FINDS matches, 1 when it doesn't.
- Contract script treats non-zero exit as failure, so bare grep passes only when the
  symbol still exists — wrong for "confirm it's gone" checks.
- Fix: use `bash -c '! grep -rn "foo" src/'` in TEST_CMD lines.
- Similarly: `npm run lint` (prettier --check) exits 1 when formatting issues exist.
  If repo already has pre-existing lint debt, this check will always fail. Scope
  contract checks to verify the CHANGE, not pre-existing repo health.

2026-03-01: Token optimization opportunities identified:
- delegate-codex-task.sh: Codex output IS captured by Claude (passes through token budget).
  A --quiet mode suppressing per-turn transcript, returning only final summary + contract
  results, could cut delegation cost by ~80%.
- contract verification: prints [contract][OK] for every check — should collapse to
  "✓ N/N contract checks passed" on success, only expand on failure.
- project-status.sh: needs verbosity audit — likely has sections that could be condensed.
- pre-commit hook: now skips tests + lint-docs for docs-only commits (no staged .ts/.tsx).
  lint-docs skip reasoning: source commits can't change docs state, so lint always passes.

2026-03-01: DEBT-002, DEBT-006, DEBT-008, DEBT-012, DEBT-014 all need rewriting before
delegation — repo structure has changed significantly since they were written. Touchpoints
and problem descriptions are stale. Do NOT delegate without a freshness pass first.

2026-02-26: `git merge --squash` vs cherry-pick — the delegate script currently cherry-picks the
Codex commit by hash. `--squash` would be cleaner and more scriptable (no need to know the hash,
works with N commits). BUT: original intent may have been to preserve multiple logical commits
from a long Codex session (e.g. test commit + impl commit as separate history entries). Revisit:
is that actually needed, or do we always want 1 commit per story regardless?
