# META-007: Formalize Test Methodology Requirements in Implementation Plans

## Status
Ready

## Description

Implementation plans currently have inconsistent test coverage sections. Some plans
(BUG-005) include a test coverage audit and snapshot-first strategy, while others
(BUG-007, BUG-008) list test scenarios but don't audit existing coverage or specify
test methodology.

### Problem

Without a standard, agents receiving plans may:
- Skip writing tests entirely
- Write tests that duplicate existing coverage
- Miss critical failure paths
- Not know whether to use integration tests, unit tests, or snapshots

### Proposed Standard

Every implementation plan in `docs/plans/` should include a **Test Section** with:

1. **Coverage Audit** — What tests already exist for the affected code paths? List test files, fixture files, and what scenarios they cover.
2. **Gap Analysis** — What's NOT covered? Explicitly list failure paths, edge cases, and boundary conditions with no tests.
3. **Methodology** — Which test approach for this change? (Integration via `api.test.ts`, unit test, snapshot, manual-only.) Reference `docs/guides/testing.md` conventions.
4. **Snapshot-First Rule** — For bug fixes: capture current (broken) behavior as a failing test before implementing the fix. This documents the bug and proves the fix works.
5. **Fixture Requirements** — List new fixture files needed with their expected shape.

### Deliverables
- [ ] Add "Test Section Template" to `docs/guides/work-organization.md` (or a new `docs/guides/plan-template.md`)
- [ ] Backfill existing plans in `docs/plans/` with the standard sections (or mark as exempt with rationale)
- [ ] Add a checklist item to CLAUDE.md plan workflow: "Verify plan includes test methodology section"

## Related
- [META-006](META-006-planning-traceability-and-doc-hygiene.md)
- [DEBT-009](DEBT-009-testing-approach-evaluation.md)
- `docs/guides/testing.md`
