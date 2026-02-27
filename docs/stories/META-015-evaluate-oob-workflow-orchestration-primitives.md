# META-015: Evaluate OOB primitives for deterministic workflow orchestration

## Status
Proposed

## Epic
None

## User Story
As a maintainer, I want to compare in-repo workflow scripts against out-of-box orchestration primitives, so that deterministic execution can be enforced with less custom maintenance.

## Acceptance Criteria
- [ ] Inventory current custom workflow primitives (`delegate-codex-task`, `wave-runner`, history curation gates, hooks).
- [ ] Evaluate at least 3 external/OOB alternatives (for example: task runners, CI/local policy engines, git wrappers).
- [ ] Define adoption criteria (determinism, auditability, local ergonomics, bypass resistance, maintenance cost).
- [ ] Recommend one path:
  - [ ] Continue custom scripts with tighter guardrails, or
  - [ ] Adopt/compose external primitives, or
  - [ ] Hybrid model.
- [ ] Record final recommendation in a guide or ADR and link it here.

## Context
Created via `scripts/new-story.sh` on 2026-02-20 after observed delegation drift caused by base-branch context mismatch.
This story is specifically about whether strong deterministic primitives already exist outside this repository and how they compare to current custom tooling.

## Related
- `docs/stories/DEBT-033-deterministic-execution-protocol.md`
- `docs/guides/work-organization.md`
- `docs/guides/workflow.md`
