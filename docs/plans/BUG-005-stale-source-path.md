# Plan: BUG-005 — Source Path Goes Stale After File Move

**Status:** Needs Test Coverage Audit (pre-implementation)
**Story:** [BUG-005](../stories/BUG-005-source-path-stale-after-file-move.md)
**Agent:** Claude Code (complex, multi-file, event handling)
**Branch:** `fix/stale-source-path`

## Existing Test Coverage Audit

### What's Covered
- `getTFileForPath` — 5 fixture files, all happy path (file exists, returns TFile-like object)
  - `getTFileForPath_Untitled.json` → `{"basename": "Untitled", "parent": {"name": ""}}`
  - `getTFileForPath_constitution.json` → `{"basename": "constitution", "parent": {"name": "Claude's Constitution"}}`
  - `getTFileForPath_constitution_root.json`, `_folder.json` — path variations
  - `getTFileForPath_Atomic-Habits_Annotations.json` — MoonReader source
- `AnnotationsNote.initialize()` — tested in `api.test.ts`, `annotations.test.ts`, `deck-landing-page.test.tsx`, `routes_books_api.test.ts` — all happy path
- `renameFile` — mocked in `api_orchestrator.test.ts` for import flow (not vault events)

### What's NOT Covered (gaps)
| Area | Coverage | Impact |
|------|----------|--------|
| `getTFileForPath` with missing file | None | No test for the throw path |
| `AnnotationsNote.initialize()` with stale path | None | No test for crash scenario |
| `updatePath()` | None | Zero coverage |
| `vault.on('rename')` event handling | None | No vault event mocking exists |
| `main.ts` | None | No `main.test.ts` file |
| Index filtering of incomplete notes | None | No test for post-init cleanup |

### Snapshot-First Strategy

Before implementing the fix, capture the **current failing behavior** as a test:

**Step 0: Add failing test snapshot**
```typescript
// tests/api.test.ts or tests/models/annotations.test.ts
describe("BUG-005: stale source path", () => {
    test("initialize() throws when source file has been moved", async () => {
        // Setup: create AnnotationsNote with a path that getTFileForPath will reject
        // This documents the current broken behavior before we fix it
        // Expect: throws "no getTFileForPath: no TFile found for ..."
    });
});
```

This requires a new fixture: `getTFileForPath_moved.json` with input matching a stale path and output that triggers the throw (or a mock override that throws).

**Step 1: Verify snapshot test fails as expected (documents the bug)**
**Step 2: Implement Phase 1 fix (path validation)**
**Step 3: Snapshot test now passes (crash prevented)**
**Step 4: Add Phase 2 tests (event handler)**

## Failure Chain (traced)

```
User moves file: Clippings/Old/Note.md → Clippings/New/Note.md
  → Obsidian fires vault.on('rename', file, oldPath)
  → [NO EVENT LISTENER] ← root cause
  → AnnotationsNote.path = "Clippings/Old/Note.md" (stale)
  → Any re-initialization: getMetadataForFile(stalePath)
    → getTFileForPath(stalePath) at disk.ts:9-13
    → THROWS: "no getTFileForPath: no TFile found for ..."
```

**Caught at:** `AnnotationsNoteIndex.initialize()` line 610-618 has try/catch, but the broken instance remains in the index.

## Phase 1: Prevent Crash (defensive)

### `src/data/models/AnnotationsNote.ts:301-334`

Add path validation before metadata read in `initialize()`:
```typescript
async initialize() {
    // Pre-flight: verify file still exists at this.path
    const tfile = vault.getAbstractFileByPath(this.path);
    if (!tfile) {
        console.warn(`Source note path stale, skipping init: ${this.path}`);
        return this;
    }
    // ... rest of existing initialization unchanged
}
```

### `src/data/models/AnnotationsNote.ts:606-623` (AnnotationsNoteIndex)

After the try/catch in `initialize()`, exclude notes that didn't fully initialize:
```typescript
// After initialization loop, filter out incomplete notes
this.sourceNotes = this.sourceNotes.filter(n => n.bookSections.length > 0);
```

## Phase 2: Proper Event Handling (correct fix)

### `src/main.ts` (after line 84)

Register vault rename listener using Obsidian's standard event pattern:
```typescript
this.registerEvent(
    this.app.vault.on('rename', (file, oldPath) => {
        const note = this.annotationsNoteIndex.sourceNotes.find(
            n => n.path === oldPath
        );
        if (note) {
            note.updatePath(file.path);
        }
    })
);
```

### `src/data/models/AnnotationsNote.ts:295-299`

`updatePath()` already exists and handles path + name update. Verify it also updates any cached references (e.g., `fileTagsMap` key).

## Files to Modify

| File | Change | Lines |
|------|--------|-------|
| `src/data/models/AnnotationsNote.ts` | Path validation in `initialize()` | 301-334 |
| `src/data/models/AnnotationsNote.ts` | Filter incomplete notes in index init | 606-623 |
| `src/main.ts` | Add `vault.on('rename')` listener | after 84 |

## Design Decisions

- **No path recovery heuristics** — too complex for v0.6.0. If file moved and path can't resolve, deck excluded until next plugin reload.
- **Phase 2 solves the common case** — user moves file while plugin running. Event listener updates path immediately.
- **Phase 1 is belt-and-suspenders** — handles edge cases where event was missed.
- **Snapshot-first** — capture current failing behavior as test before implementing fix.

## Test Plan

| Order | Test | Fixture | Phase |
|-------|------|---------|-------|
| 0 | Capture: "initialize() throws when source moved" | `getTFileForPath_moved.json` | Pre-fix snapshot |
| 1 | "initialize() skips gracefully when source moved" | same fixture | Phase 1 |
| 2 | "index excludes stale-path notes after init" | mock init failure | Phase 1 |
| 3 | "updatePath() updates name correctly" | existing fixtures | Phase 2 |
| 4 | "vault rename event updates AnnotationsNote path" | mock vault event | Phase 2 |

## Verification

```bash
npm test -- api.test
npm test -- annotations.test
npm test  # full suite
```
