# DEBT-010: Capture-to-Fixture Development Cycle

## Status
In Progress

## Branch
chore/polish-usable-version-2026-02-17

## Plan
See [DEBT-010-plan.md](DEBT-010-plan.md) for implementation details.

## Description
The project uses fixture-based mocking (`createDiskMockFromFixtures`) to test against Obsidian API outputs. Fixtures were originally generated using `captureProxy.ts` which wraps module exports and writes call data to JSON files via `fs`.

The current cycle has friction points worth documenting for future improvement.

### What Works
- `captureProxy.ts` exists and can wrap module exports to capture call data
- `fs` is accessible in desktop Obsidian plugin runtime (not mobile)
- `createDiskMockFromFixtures` in `tests/helpers.ts` replays fixtures as mock implementations
- Fixture format is simple: `{ method, input, output }`

### Friction Points
1. **No standard capture workflow**: captureProxy isn't wired into disk.ts. Each capture requires ad-hoc logging in main.ts
2. **Large file problem**: `getFileContents` fixtures for big files bloat the test directory. No truncation or summarization strategy
3. **Fixture path mismatch**: Real vault paths (e.g., `Clippings/Claude's Constitution.md`) differ from simplified fixture paths (`constitution.md`). Tests pass but aren't representative
4. **Staging vs direct write**: Captures go to an arbitrary location, then need manual copy to `tests/fixtures/`. No promotion workflow
5. **Stale fixtures**: No mechanism to detect when a fixture no longer matches real Obsidian API output

### Tradeoff Space
- **Capture everything** → faithful replica, but large fixtures, hard to reason about
- **Capture selectively** → minimal, but risk missing edge cases (BUG-003 proves this)
- **Hand-write fixtures** → precise, but can't write what you don't know
- **Capture to fixtures directly** → convenient, accumulates stale data
- **Capture to staging** → cleaner, adds manual step

### Open Questions
- Is the goal a faithful vault replica or targeted edge-case capture?
- Should captureProxy be wired into disk.ts permanently (with a flag) or remain ad-hoc?
- Would a `npm run capture` script that toggles capture mode and rebuilds be worth the setup?

### Adoption Trigger
- Apply a rule-of-3 to avoid premature tooling investment:
  - implement full vault artifact + capture workflow only if the same fixture-realism regression class repeats 2-3 more times.

## Impact
Low — current approach works. This becomes important when fixture creation is frequent or when bugs like BUG-003 reveal gaps between fixtures and reality.

## Session Notes
- [2026-02-16](../sessions/2026-02-16-DEBT-010.md)
- [2026-02-17](../sessions/2026-02-17-DEBT-010.md)

## Related
- [BUG-003](BUG-003-filetags-string-tags-crash.md) — discovered via ad-hoc capture
- [BUG-010](BUG-010-capture-proxy-getter-only-exports.md) — getter-only CJS exports bug found during implementation
- [BUG-011](BUG-011-capture-proxy-non-configurable-exports.md) — non-configurable exports bug
- [SPIKE-009](SPIKE-009-mcp-devtools-feedback-loop.md) — idea for automated error feedback
- [DEBT-009](DEBT-009-clippings-test-approach.md) — testing approach evaluation
- Guide: [docs/guides/capture-fixtures.md](../guides/capture-fixtures.md)
