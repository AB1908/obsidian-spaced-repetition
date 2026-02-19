# Test Contract: DEBT-030 Markdown Migration

**Story:** [DEBT-030](../stories/DEBT-030-complete-markdown-source-migration.md)
**Style:** Contract-first, integration-heavy

## Test Policy
Primary guardrail is existing integration/fixture suite. New tests should be additive and minimal.

Required baseline gates on every execution commit:
1. `npm test -- --runInBand`
2. `OBSIDIAN_PLUGIN_DIR=. npm run build`

Explicitly protect existing fixture contracts:
- `tests/api.test.ts`
- `tests/api.clippings.test.ts`
- `tests/routes_books_api.test.ts`

## New/Updated Tests (Minimal)
1. Route-level behavior contract in `tests/routes/books/book/annotation/AnnotationListPage.test.tsx`:
- MoonReader card-creation controls/filters
- Markdown card-creation controls/filters
- Import flow invariants
2. API/model capability contract tests (one focused block in existing API test file):
- Source capability mapping by source type
- Mutation confirmation flags remain correct

## What We Avoid
- No fixture explosion unless existing harness cannot represent capability seam.
- No snapshot churn without behavior intent.
- No broad unit-test proliferation for internal refactor-only wiring.

## Pass/Fail Definition
Pass only if:
- Existing integration fixture tests stay green unchanged.
- New source-capability behavior assertions pass.
- No markdown-strategy regressions in navigation/listing workflows.

## Drift Triggers (pause)
- Need to modify many unrelated fixtures to make tests pass.
- Capability contract requires route-level ad hoc exceptions.
- Existing API tests fail due implicit coupling not covered by plan.
