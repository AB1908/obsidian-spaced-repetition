# META-019: Story Drift Detection and Agentic Story Refresh

## Status
Proposed

## Epic
None

## Description

As the codebase evolves rapidly, story files describing implementation touchpoints,
file paths, and architectural context go stale. A story written against the old
`api.ts` monolith may reference files that no longer exist, or describe a problem
that's already been partially solved by an adjacent refactor.

This becomes a reliability problem when delegating to autonomous agents: a Codex
agent executing against a stale plan may operate on the wrong files or solve a
problem that no longer exists in the described form.

### Observed instance

After 0.6.0 shipped, multiple DEBT stories (DEBT-002, DEBT-006, DEBT-008, etc.)
were found to reference outdated file paths and describe problems in code that has
since been significantly restructured. The stories needed manual rewriting before
they could be safely delegated.

### Story Drift Sources

1. **File renames/moves** — "Likely Touchpoints" paths no longer exist
2. **Partial solutions** — adjacent work partially addressed the problem described
3. **Superseded context** — the architectural framing is stale (e.g. references
   to `api.ts` as a monolith after it was partially decomposed)
4. **Done dependencies** — a story says "depends on X" but X is now Done

### Proposed Approaches

**A — Background drift-detection agent (periodic)**
A scheduled or session-start agent that reads active stories, checks touchpoint
file paths against the current repo, and flags stories whose paths don't exist
or have moved. Low false-negative rate; doesn't require deep code understanding.

**B — Agentic story refresh on merge**
When a feat/fix/refactor commit lands, a post-merge hook identifies which
story files reference the touched files and queues them for a lightweight
"still accurate?" review. Higher signal but more complex.

**C — Manual refresh gate before delegation**
Before delegating any story, require a "story freshness check" step in the
delegation workflow: agent reads the story + referenced files and confirms
the touchpoints still exist and the problem is still present.

**D — Story staleness marker**
Add a `## Last Verified` date field to stories. Anything older than N days
gets a `stale` badge in `project-status.sh`. Human reviews stale stories
at session start.

Approaches C and D are lowest effort and highest immediate value.
Approach A is a good medium-term automation target.
Approach B is aspirational — worth a SPIKE.

## Acceptance Criteria

- [ ] At least one approach documented and adopted
- [ ] `project-status.sh` surfaces stories with stale touchpoints (or last-verified date)
- [ ] Delegation workflow includes a freshness check step

## Likely Touchpoints
- `scripts/project-status.sh`
- `scripts/delegate-codex-task.sh`
- `docs/guides/work-organization.md`
- Story template (add `## Last Verified`)

## Related
- [META-006](META-006-planning-traceability-and-doc-hygiene.md)
- [META-007](META-007-formalize-plan-test-methodology.md)
