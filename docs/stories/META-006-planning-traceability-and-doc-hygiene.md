# META-006: Planning Traceability and Doc Hygiene

## Status
Ready

## Description

Two related gaps in the current workflow:

### 1. No reliable way to verify planning correctness

Plans reference stories, prior work, and insertion points. If those stories are
actually Done/archived (e.g. STORY-010, DEBT-003), the plan language becomes
misleading and causes wasted planning effort or wrong assumptions by delegates.

There is no mechanism to detect when a plan references stale or incorrect story
state. The `Closes: STORY-NNN` convention in commit bodies (demonstrated in
`feat(annotation-list)`: e644445) is a starting point, but no tooling exists to
audit divergence between story-catalog status and commit history.

### 2. Story status updates are manual and easy to omit

When a feat commit lands, the story's Status field must be manually updated to Done
and acceptance criteria checked. This is currently part of the merge process but has
no enforcement — easy to forget under context pressure.

### Proposed mechanisms (evaluate and implement the most valuable)

**A — `Closes: STORY-NNN` audit script**
Read Done stories from catalog, check git log for matching `Closes:` entry. Stories
marked Done with no commit → diverged, flagged. Runnable on demand or as pre-push hook.

**B — Commit-msg hook: validate `Closes:` references**
When `Closes:` appears in commit body, hook verifies the referenced story file exists
and is not already Done. Catches typos and double-closing at write time.

**C — Pre-push drift detection**
At push time: any Done story with no matching `Closes:` commit in history → warning.
Slower than A but automatic.

**D — Story → Plan → Semantic log chain audit**
Convention: Done story links to plan file; plan links to semantic log; semantic log
links to commit hash. Script verifies the full chain. High ceremony, good for audits.

### Starter: plan correctness check

Before delegating, the session should verify that stories referenced in a plan are
not already Done/archived. This can be a checklist item in `agents.md` or a script
that reads plan files and cross-references story-catalog.

## Acceptance Criteria
- [ ] Choose which mechanism(s) to implement from A–D above
- [ ] Implement chosen mechanism(s) in scripts/ or .husky/
- [ ] `agents.md` updated with pre-delegation plan correctness check guidance
- [ ] `Closes: STORY-NNN` convention documented in `docs/guides/work-organization.md`

## Related
- [META-004](META-004-delegation-observability-and-guardrails.md)
- [META-005](META-005-delegation-dirty-docs-and-branch-strategy.md)
- Commit e644445 (`feat(annotation-list)`) — first use of `Closes:` convention
