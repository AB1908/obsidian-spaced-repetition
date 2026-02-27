# META-008: api.clippings.test.ts Testing Approach Evaluation

## Status
Ready

## Epic
None

## Description
`tests/api.clippings.test.ts` uses a `diskSummary` pattern to verify the clipping deck creation flow: it inspects mock call counts, argument values, and return values of disk functions. This effectively tests implementation details (which disk methods were called, how many times) rather than final state.

Since the test harness provides a mock backend via `createDiskMockFromFixtures`, an alternative approach would assert against the final state of the system (e.g., what files exist, what content they contain) rather than how we got there. This would be more resilient to internal refactoring.

### Tradeoff
- **diskSummary (current):** Simpler to write, catches unexpected side effects (e.g., extra disk calls), but brittle to refactoring
- **Final-state assertions:** More resilient to internal changes, tests behavior not implementation, but requires richer mock infrastructure to query final state
- Simplicity currently trumps accuracy — revisit when the test becomes a maintenance burden or when disk.ts refactoring (DEBT-006, DEBT-007) changes the internal call patterns

## Impact
Low — tests are passing and maintainable today. This is a future consideration.

## Acceptance Criteria
- [ ] Revisit when disk-layer refactoring (DEBT-006/007) causes test breakage
- [ ] If rewriting, pilot final-state assertion approach and compare maintenance characteristics

## Related
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk.ts refactoring may trigger test changes
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md) — persistence refactor will likely break diskSummary assertions
