# Plan: BUG-008 — MoonReader Book Name Shows "Annotations"

**Status:** Accepted
**Story:** [BUG-008](../stories/BUG-008-moonreader-name-shows-annotations.md)
**Agent:** Codex 5.3
**Branch:** `fix/moonreader-book-name`

## Root Cause

BUG-006 fix (commit `c0533ec`) replaced `getParentOrFilename(path)` with `getTFileForPath(path).basename`. This fixed clippings but broke MoonReader:

| Source Type | File Layout | Old (folder name) | New (basename) | Correct |
|-------------|------------|-------------------|----------------|---------|
| MoonReader | `BookTitle/Annotations.md` | "BookTitle" ✓ | "Annotations" ✗ | frontmatter title |
| Clippings | `Clippings/Topic/Topic.md` | "Clippings" ✗ | "Topic" ✓ | basename |

## Fix: Source-Type-Aware Name Derivation

### `src/data/models/AnnotationsNote.ts:317`

**Current:**
```typescript
this.name = getTFileForPath(this.path).basename;
```

**Fix:**
```typescript
this.name = getTFileForPath(this.path).basename;
const bookFrontmatter = this.getBookFrontmatter();
if (bookFrontmatter?.title) {
    this.name = bookFrontmatter.title;
}
```

### `src/data/models/AnnotationsNote.ts:295-299` (`updatePath()`)

Apply same logic:
```typescript
updatePath(newPath: string) {
    this.path = newPath;
    this.name = getTFileForPath(newPath).basename;
    const bookFrontmatter = this.getBookFrontmatter();
    if (bookFrontmatter?.title) {
        this.name = bookFrontmatter.title;
    }
}
```

## Why This Works

- `getBookFrontmatter()` (line 531-553) returns non-null only for MoonReader sources (checks for `path`, `title`, `lastExportedTimestamp`, `lastExportedID` in frontmatter)
- Clippings/markdown sources return null → basename stands
- MoonReader sources get their frontmatter title → correct book name

## Files to Modify

| File | Lines | Change |
|------|-------|--------|
| `src/data/models/AnnotationsNote.ts` | 317 | Add frontmatter title override |
| `src/data/models/AnnotationsNote.ts` | 295-299 | Same in `updatePath()` |

## Test Plan

| Scenario | Source | Expected Name |
|----------|--------|--------------|
| MoonReader book | `Atomic Habits/Annotations.md` (has frontmatter title) | "Atomic Habits" |
| Clippings | `Clippings/Constitution/Constitution.md` (no MR frontmatter) | "Constitution" |
| Markdown note | `Notes/Topic.md` (no MR frontmatter) | "Topic" |

Existing fixtures already cover both source types:
- `getMetadataForFile_Atomic-Habits_Annotations.json` — has MoonReader frontmatter with `title`
- `getMetadataForFile_Clippings_Claude-s-Constitution_Claude-s-Constitution.json` — no MoonReader frontmatter

## Verification

```bash
npm test -- api.test
npm test -- annotations.test
npm test  # full suite
```
