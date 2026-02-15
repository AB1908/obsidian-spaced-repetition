# DEBT-010: Capture-to-Fixture Development Cycle

## Status
Ready

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

## Impact
Low — current approach works. This becomes important when fixture creation is frequent or when bugs like BUG-003 reveal gaps between fixtures and reality.

## Related
- [BUG-003](BUG-003-filetags-string-tags-crash.md) — discovered via ad-hoc capture
- [DEBT-009](DEBT-009-clippings-test-approach.md) — testing approach evaluation
