# BUG-003: fileTags() Crashes When Obsidian Returns Single Tag as String

## Status
Ready

## Description
`fileTags()` in `src/infrastructure/disk.ts:69-70` assumes `frontmatter.tags` is always an array:

```typescript
const frontmatterTags = clonedMetadataCache[hash]?.frontmatter?.tags;
const tagsArray = frontmatterTags || [];
```

When a note's YAML has a single tag without list syntax (e.g., `tags: review/book` instead of `tags:\n  - review/book`), Obsidian's metadata cache returns a **string**, not an array. This string passes the `|| []` fallback (strings are truthy), gets stored in the `tagMap`, and later crashes `normalizeTags()` when it calls `.map()` on a string.

### Impact
The crash occurs inside `selectEligibleSourcePaths()` during `AnnotationsNoteIndex.initialize()`. Because the error isn't caught at the per-file level, it **silently prevents all sources from loading** — not just the problematic file.

### Reproduction
Observed in production vault where `Learning/Learning.md` has frontmatter `tags: review/book` (string form). Captured via diagnostic logging — see `filetags.capture` for raw data.

### Fix
Either:
- **In `fileTags()`**: Normalize to array: `const tagsArray = Array.isArray(frontmatterTags) ? frontmatterTags : frontmatterTags ? [frontmatterTags] : [];`
- **In `normalizeTags()`**: Defensive coercion before `.map()`

The `fileTags()` fix is preferred — it keeps the contract clean at the source.

### Test Fixture Gap
Current `fileTags` fixture only has array-form tags. Need a fixture entry with string-form tags to reproduce in tests.

Also: test fixture uses path `constitution.md` but real vault path is `Clippings/Claude's Constitution.md`. Fixture isn't representative of production paths.

## Acceptance Criteria
- [ ] `fileTags()` normalizes string tags to arrays
- [ ] Test fixture includes a string-form tag entry
- [ ] `getNotesWithoutReview` test snapshot reflects real vault structure
- [ ] All sources load correctly when one file has string-form tags

## Related
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk.ts business logic analysis
- [DEBT-008](DEBT-008-notes-without-review-naming.md) — getNotesWithoutReview naming
