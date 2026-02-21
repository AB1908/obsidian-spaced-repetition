# BUG-006 Session Notes

## Session: 2026-02-16

### Initial Scoping Feedback

**Issue:** First pass proposed adding a `getBasename()` function to `disk.ts` and doing a mechanical rename. This missed the deeper problem:

- The *choice* of parent name vs file name is domain logic, not infrastructure
- `api.ts:348` directly mutates `book.path` and `book.name` — a state transition that belongs in the domain model
- Adding `getBasename` to disk would just replace one infrastructure-layer domain decision with another

**Correction:** User directed a deeper refactor:
1. Move name derivation entirely into `AnnotationsNote` (the domain model)
2. No new disk.ts exports — reuse existing `getTFileForPath`
3. Encapsulate path+name updates in `updatePath()` method

**Lesson:** When a bug is caused by misplaced business logic, the fix should move the logic to the right layer — not just change which wrong-layer function gets called. Always evaluate separation of concerns before proposing a fix.

### Errors / Deviations

**Context loss on story completion:** At end of session, agent was asked to verify acceptance criteria were met. The code fix was already committed (commits `55198ed`, `bf7e07c`) with passing tests, but the agent didn't check git history or test results first — it re-verified the code, then produced a docs-only commit (`8b2d2bf`) to mark the story done and check the acceptance criteria boxes. This commit should have been squashed into the earlier work, not a separate trailing commit.

**Root cause:** Likely context window management — earlier implementation actions had been compressed/summarized, so the agent treated "check if done" as a fresh task rather than recognizing it had already completed the work. The commit approval workflow also didn't catch that this was unnecessary churn.

**Lesson:** Before producing new commits, check `git log` to see what's already been done in the current session. If the only remaining action is updating docs metadata, fold it into the last relevant commit rather than creating a new one.

### Observations

- The fixture mock system matches on `(method, JSON.stringify(input))` pairs, so multiple fixtures per method with different inputs work fine
- `getTFileForPath` has zero existing test fixtures — clean migration path
- `getParentOrFilename_constitution.json` had output `"Claude's Constitution"` which was the parent folder name — the actual manifestation of the bug in test data

### Workflow Improvement: Plan-Commit-Review Feedback Loop

**Idea discussed during this session.** To be enforced as process going forward.

**The problem:** Plans diverge from implementations with no structured way to learn from it.

**Proposed workflow:**

1. **Plan phase:** When creating stories, fully scope the plan (commits, touchpoints, approach) and commit it as an immutable record of intent.
2. **Human review of plan:** Force review before implementation begins. Record feedback and any corrections.
3. **Delegate to agent:** Agent implements from the committed plan.
4. **Post-implementation divergence check:** Automatically compare what was planned vs what actually happened. Categorize divergences:
   - **Scope miss** — didn't anticipate a needed change
   - **Wrong decomposition** — commits got merged/split differently
   - **Discovery** — hit something unexpected during implementation
   - **Over-planning** — planned work that turned out unnecessary
5. **Feed back into planning:** Use divergence patterns over time to improve future planning accuracy (e.g., "we consistently underestimate test fixture changes").

**Status:** Captured here for deeper planning in a future session. Will formalize as a guide or ADR once the process is tested on a few stories.

**Next step:** When back in Claude Code, use these session notes to draft a formal process doc and trial it on the next story.
