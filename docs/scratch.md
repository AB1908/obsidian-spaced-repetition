# Scratch — observations and deferred thoughts

Append-only. Review at session start. Promote to story or delete when actioned.

---

2026-02-26: `git merge --squash` vs cherry-pick — the delegate script currently cherry-picks the
Codex commit by hash. `--squash` would be cleaner and more scriptable (no need to know the hash,
works with N commits). BUT: original intent may have been to preserve multiple logical commits
from a long Codex session (e.g. test commit + impl commit as separate history entries). Revisit:
is that actually needed, or do we always want 1 commit per story regardless?
