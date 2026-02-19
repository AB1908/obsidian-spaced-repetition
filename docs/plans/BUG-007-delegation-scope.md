# Delegation Scope: BUG-007 Heading Level Strategy

**Story:** `docs/stories/BUG-007-section-list-flattens-heading-levels.md`  
**Primary plan:** `docs/plans/BUG-007-heading-level-strategy.md`  
**Target branch:** `fix/heading-level-strategy`

## Plan Scope

Implement heading selection strategy for direct-markdown sources:
- Prefer H1 headings (`level === 1`) when at least one exists.
- Fallback to H2 headings (`level === 2`) when no H1 headings exist.
- Return empty list when no H1/H2 headings exist.
- Keep MoonReader behavior unchanged.

Primary code change:
- `src/data/models/strategies/MarkdownSourceStrategy.ts`

Expected non-code touchpoints:
- `docs/stories/BUG-007-section-list-flattens-heading-levels.md` (mark complete when done)

## Test Plan (TDD)

Write failing tests first, then implement fix.

Required scenarios:
1. Mixed headings (`H1 + H2 + H3`) => returns only H1.
2. Only H2/H3 headings => returns only H2.
3. No headings => returns empty list.
4. MoonReader strategy regression check remains green.

Likely test file:
- `tests/api.test.ts`

Use existing sanitized fixtures where possible. If new fixtures are required, keep dummy/lorem-safe content only.

## Execution Plan

1. Create/attach worktree on `fix/heading-level-strategy` from `main`.
2. Add/adjust tests for BUG-007 cases and confirm they fail before implementation.
3. Implement minimal strategy change in `MarkdownSourceStrategy`.
4. Re-run targeted tests, then full suite.
5. Update story status/criteria checkboxes if fully satisfied.
6. Commit with clear message referencing BUG-007.
7. Return a concise completion summary with changed files + test evidence.

## Verification Commands

```bash
npm test -- api.test
npm test -- --runInBand
OBSIDIAN_PLUGIN_DIR=. npm run build
```

## Safety Constraints

- No destructive git operations (`reset --hard`, forced cleanups).
- Stay within declared scope unless a blocker requires a documented scope expansion.
- Do not introduce real user/book content into tests or fixtures.
