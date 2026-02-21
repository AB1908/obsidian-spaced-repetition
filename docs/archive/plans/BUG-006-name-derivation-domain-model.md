# BUG-006 Implementation Plan: Move name derivation into domain model

**Story:** `docs/stories/BUG-006-source-chooser-label-uses-folder-name.md`

## Problem

`getParentOrFilename` in `disk.ts` bakes domain logic ("prefer parent folder name") into the infrastructure layer. The model should own name derivation. Additionally, `api.ts:347-348` directly mutates `book.path` and `book.name` — that state transition belongs in the domain model.

## Approach

**No new exports in `disk.ts`.** The model already imports `getTFileForPath`. We move the naming decision into `AnnotationsNote`.

## Steps

### Step 1: Add `updatePath(newPath)` to `AnnotationsNote`

Encapsulates path+name state transition:

```ts
updatePath(newPath: string) {
    this.path = newPath;
    this.name = getTFileForPath(newPath).basename;
}
```

### Step 2: Fix `initialize()` — replace `getParentOrFilename` with basename

```ts
// Before
this.name = getParentOrFilename(this.path);
// After
this.name = getTFileForPath(this.path).basename;
```

Remove `getParentOrFilename` from imports. **This is the bug fix.**

### Step 3: Refactor `api.ts:343-349` to use `book.updatePath()`

```ts
// Before
book.path = newPath;
book.name = getParentOrFilename(newPath);
// After
book.updatePath(newPath);
```

Remove `getParentOrFilename` from api.ts imports.

### Step 4: Delete `getParentOrFilename` from `disk.ts:107-112`

No callers remain.

### Step 5: Migrate test fixtures

Fixture mock system matches on `(method, JSON.stringify(input))`. No `getTFileForPath` fixtures exist, so no conflicts.

Old `getParentOrFilename_*` files become `getTFileForPath_*` files with TFile-like output shape.

| Old file | New file | Input | Output |
|----------|----------|-------|--------|
| `getParentOrFilename_2025-12-07T19-37-22-046Z_j780r6.json` | `getTFileForPath_Untitled.json` | `"Untitled.md"` | `{ "basename": "Untitled" }` |
| `getParentOrFilename_constitution.json` | `getTFileForPath_constitution.json` | `"constitution.md"` | `{ "basename": "constitution" }` |
| `getParentOrFilename_constitution_root.json` | (merged into above — same input/path) | — | — |
| `getParentOrFilename_constitution_folder.json` | `getTFileForPath_constitution_folder.json` | `"constitution/constitution.md"` | `{ "basename": "constitution" }` |

### Step 6: Update 6 test files with new fixture filenames

### Step 7: Update BUG-006 story status

## Key Design Decisions

- **No `getBasename` in disk.ts** — model already has `getTFileForPath`, adding a wrapper is unnecessary
- **`updatePath()` method** — prevents api.ts from reaching into model internals
- **TFile-like fixture output** — includes `parent.name` for forward-compatibility

## Risk: Low

- 2 call sites, both replaced
- Zero existing `getTFileForPath` fixtures
- MoonReader books (folder=filename) unchanged; clippings in shared folders fixed
