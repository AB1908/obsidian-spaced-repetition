# META-031: Test Contract and Planning Spec Foundation

## Status
Proposed

## Reviewed
No

## Epic
None

## Description

The current planning workflow (plan file + separate test contract) has friction and scaling
problems that need to be resolved before the workflow is used for large greenfield sessions.

### Current gaps

1. **Test contract is too terse for review.** `TEST_NAME:` lines alone don't communicate
   what behavior is being committed to. Reviewers must cross-reference plan prose with
   contract names and mentally reconcile them — two documents, drift risk.

2. **Dual-file friction.** Every delegation requires two files (plan + contract). The
   contract is usually written last, is shorter than the plan, and partially duplicates
   the plan's "Test Contract" prose section.

3. **Greenfield scaling problem.** The current one-plan-one-contract-per-story model
   works well for isolated debt/bug work. It breaks down for multi-feature sessions where:
   - Features share new infrastructure (models, API endpoints, fixtures)
   - Test setup must be created before individual feature tests can be written
   - Integration tests span multiple stories
   - The spec is more fluid — behavior emerges from feature interaction, not just
     individual story acceptance criteria
   - A single Codex delegation may need to implement 3-4 inter-dependent stories
     with a shared test scaffold

### Options considered (from session 2026-03-28)

**A — Enrich contract format** — add `TEST_DESCRIPTION:` / `GIVEN/WHEN/THEN:` fields.
Machine-parseable, richer for reviewers. Still two files.

**B — Merge contract into plan** — put structured `TEST_FILE:`/`TEST_NAME:` block inside
plan under `## Test Contract`. One document. `verify-test-contract.sh` reads plan directly.

**C — Test skeletons as contract** — write `test.todo()` / `test.skip()` entries as the
contract artifact. Reviewer reads actual test code. Most honest spec. Requires test file
change during planning phase (green — skipped tests don't fail).

**D — Status quo with discipline** — keep both files, enforce sync via review.

### Recommended path

- **Short term:** Option B — merge structured block into plan, update
  `verify-test-contract.sh` to parse `## Test Contract` section from plan file.
  Eliminates dual-file friction, no behavior change to verification.

- **Long term:** Option C — `test.todo()` skeletons as the planning artifact.
  The spec is the test code. Implementation phase fills them in. Natural TDD workflow.

- **Greenfield scaling:** Before tackling a multi-story greenfield session, define a
  shared "session test scaffold" — a single test file (or describe block) that covers
  the integration surface across all stories in the session. Individual story contracts
  then reference specific `TEST_NAME:` entries within it. This needs a template and
  possibly a new planning artifact type (e.g., `SESSION-PLAN-NNN.md`).

## Acceptance Criteria

- [ ] `verify-test-contract.sh` supports reading contract from plan file (no separate
      contract file required)
- [ ] Plan template updated to include structured `## Test Contract` section
- [ ] Greenfield session planning template defined (shared scaffold + per-story contracts)
- [ ] Delegation checklist updated to reflect new workflow
- [ ] At least one delegation done end-to-end with merged contract to validate

## Likely Touchpoints
- `scripts/verify-test-contract.sh`
- `.claude/agents.md` — delegation checklist and plan quality standard
- `docs/guides/work-organization.md` — planning workflow docs
- Plan file template (wherever it lives or needs to be created)

## Depends on
None
