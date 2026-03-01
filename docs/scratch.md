# Scratch — observations and deferred thoughts

Append-only. Review at session start. Promote to story or delete when actioned.

---

2026-03-01: Test contract gotcha — absence checks need negation.
- `grep -rn "foo" src/` exits 0 when it FINDS matches, 1 when it doesn't.
- Contract script treats non-zero exit as failure, so bare grep passes only when the
  symbol still exists — wrong for "confirm it's gone" checks.
- Fix: use `bash -c '! grep -rn "foo" src/'` in TEST_CMD lines.

2026-03-01: Token optimization opportunities identified:
- delegate-codex-task.sh: Codex output IS captured by Claude (passes through token budget).
  A --quiet mode suppressing per-turn transcript, returning only final summary + contract
  results, could cut delegation cost by ~80%.
- contract verification: prints [contract][OK] for every check — should collapse to
  "✓ N/N contract checks passed" on success, only expand on failure.
- project-status.sh: needs verbosity audit — likely has sections that could be condensed.
- pre-commit hook: now skips tests + lint-docs for docs-only commits (no staged .ts/.tsx).
  lint-docs skip reasoning: source commits can't change docs state, so lint always passes.

2026-03-01: META pattern — cheap vs expensive agent operations:
- Cheap (low token, background-safe): file reads, search, doc/story updates, catalog checks
- Expensive (high token, foreground): Codex delegation, full test runs, large codebase scans
- Could classify stories/tasks by operation tier to guide scheduling and cost expectations
- Related to META-019 (agentic refresh) — background agents should only use cheap ops

2026-03-01: DEBT-002, DEBT-006, DEBT-008, DEBT-012, DEBT-014 all need rewriting before
delegation — repo structure has changed significantly since they were written. Touchpoints
and problem descriptions are stale. Do NOT delegate without a freshness pass first.

2026-02-26: `git merge --squash` vs cherry-pick — the delegate script currently cherry-picks the
Codex commit by hash. `--squash` would be cleaner and more scriptable (no need to know the hash,
works with N commits). BUT: original intent may have been to preserve multiple logical commits
from a long Codex session (e.g. test commit + impl commit as separate history entries). Revisit:
is that actually needed, or do we always want 1 commit per story regardless?
