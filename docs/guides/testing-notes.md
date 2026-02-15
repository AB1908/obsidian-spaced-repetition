# Testing Notes

Observations about testing strategies, fixture management, and the capture-to-fixture development cycle.

## 2026-02-15: Unit tests vs integration tests tradeoff

`source-discovery.test.ts` tests pure policy functions at the unit level. These could be covered by integration tests in `api.test.ts` instead. Unit tests give precise failure messages but require more maintenance (e.g., ID shifts when fixtures change). Integration tests are more resilient but less precise.

Decision: pilot integration-test approach during next refactor (DEBT-007). See [DEBT-009](../stories/DEBT-009-clippings-test-approach.md).

## 2026-02-15: diskSummary pattern vs final-state assertions

`api.clippings.test.ts` inspects mock call counts/args (`diskSummary`) rather than asserting final state. Since `createDiskMockFromFixtures` provides a mock backend, final-state assertions would be more resilient to refactoring. Tradeoff: diskSummary is simpler to write. Revisit when refactoring causes test breakage. See [DEBT-009](../stories/DEBT-009-clippings-test-approach.md).

## 2026-02-15: Fixture capture friction

Fixtures were originally generated using `captureProxy.ts` which wraps module exports and writes to `fs`. `fs` works on desktop Obsidian but not mobile. Current workflow requires ad-hoc logging in `main.ts` to capture production data. See [DEBT-010](../stories/DEBT-010-capture-fixture-cycle.md) for full analysis.

Key insight: fixtures represent the Obsidian API boundary — the things we can't construct by hand reliably. BUG-003 proved this: nobody would guess `frontmatter.tags` could be a string without capturing real data.
