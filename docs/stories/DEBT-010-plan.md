# Plan: Production Data Capture for Atomic Habits Fixtures [DEBT-010]

## Context

We need to capture real Obsidian API output for the "Atomic Habits" book folder into JSON test fixtures. Currently `captureProxy.ts` exists but is unwired (`FIXTURES_DIR = 'placeholder'`). DEBT-010 documents this gap. The immediate goal is Atomic Habits fixtures + tests in `api.test.ts`. The broader goal is making this repeatable so future captures don't require re-inventing the workflow.

**Story:** [DEBT-010](DEBT-010-capture-fixture-cycle.md) — Capture-to-Fixture Development Cycle

---

## Step 1: Refactor `captureProxy.ts`

**File:** `src/utils/captureProxy.ts`

- Replace hardcoded `CAPTURE_MODE`/`FIXTURES_DIR` with esbuild `define` constants (`__CAPTURE_MODE__`, `__CAPTURE_FIXTURES_DIR__`)
- Guard module-level side effects (no `fs.mkdirSync` at import time unless capture active)
- Remove dead `originalApi` import and bottom-level re-exports
- Export only `createCaptureProxy<T>()` and a new `wrapDiskForCapture()` function
- `wrapDiskForCapture()` uses `require("src/infrastructure/disk")` to get the CJS module object, wraps it with the proxy, and patches exports in-place via `Object.assign(diskModule, proxied)`. Works because esbuild outputs CJS.
- Filename generation: **append mode** — `methodName_<timestamp>_<random>.json`
- Add a `capturedFrom` field to the JSON output for easier post-capture curation

## Step 2: Wire Capture in `main.ts`

**File:** `src/main.ts`

Add conditional block in `onload()`, before index initialization:

```typescript
if (typeof __CAPTURE_MODE__ !== 'undefined' && __CAPTURE_MODE__) {
    const { wrapDiskForCapture } = require("src/utils/captureProxy");
    wrapDiskForCapture();
}
```

No changes to `disk.ts` or any import paths. Dead-code-eliminated in normal builds.

## Step 3: Esbuild Define Block

**File:** `esbuild.config.mjs`

```javascript
const captureDir = process.env.CAPTURE_FIXTURES_DIR || '';
define: {
    '__CAPTURE_MODE__': JSON.stringify(!!captureDir),
    '__CAPTURE_FIXTURES_DIR__': JSON.stringify(captureDir),
},
```

## Step 4: npm Script

**File:** `package.json`

```json
"capture": "CAPTURE_FIXTURES_DIR=$(pwd)/tests/fixtures node esbuild.config.mjs"
```

## Step 5: Capture Atomic Habits Data

Manual workflow:
1. `npm run capture` — builds plugin with capture on
2. Reload Obsidian
3. Navigate to Atomic Habits in plugin UI
4. `npm run dev` — restore normal build
5. Rename captured fixtures to semantic names

## Step 6: Add Fixtures + Tests to `api.test.ts`

Add new fixtures to mock list and new describe block for Atomic Habits source.

## Step 7: Document the Workflow

New file: `docs/guides/capture-fixtures.md`

---

## Repeatability Strategy

| Mechanism | When to adopt |
|-----------|---------------|
| `npm run capture` script | Now |
| `docs/guides/capture-fixtures.md` | Now |
| `scripts/promote-fixtures.sh` | After 2nd capture session |
| Claude Code skill | After 3rd capture session |

## Test Vault Direction

**Current strategy: Append, then converge.**

Append mode now to protect existing fixtures. Strategic goal: next capture session does a full vault re-recording, switching to overwrite mode and moving toward committing vault `.md` files into `tests/vault/`.
