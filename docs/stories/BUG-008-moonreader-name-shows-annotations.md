# BUG-008: MoonReader Book Name Shows "Annotations" Instead of Book Title

## Status
Ready

## Severity
High

## Epic
None

## Depends on
- [BUG-006](BUG-006-source-chooser-label-uses-folder-name.md) — introduced regression

## User Story
As a user with MoonReader-exported books, I want the deck landing page and deck list to show the book title, not "Annotations", so I can identify my books.

## Root Cause
BUG-006 fix (commit `c0533ec`) replaced `getParentOrFilename(path)` with `getTFileForPath(path).basename` in `AnnotationsNote.ts:317`. This fixed clippings naming but broke MoonReader naming.

**MoonReader file layout:** `BookTitle/Annotations.md`
- Old behavior: `getParentOrFilename` → returned `"BookTitle"` (parent folder) ✓
- New behavior: `getTFileForPath().basename` → returns `"Annotations"` ✗

**Clippings file layout:** `Clippings/Topic/Topic.md`
- Old behavior: `getParentOrFilename` → returned `"Clippings"` ✗
- New behavior: `getTFileForPath().basename` → returns `"Topic"` ✓

The underlying issue: name derivation is source-type-dependent but the fix applied a one-size-fits-all strategy.

## Reproduction
1. Have a MoonReader-exported book at `BookTitle/Annotations.md` with frontmatter containing `title: "Book Title"`
2. Open plugin
3. Observe deck list and deck landing page show "Annotations" instead of "Book Title"

## Approach
Make name derivation source-type-aware using existing infrastructure:

1. Keep `this.name = getTFileForPath(this.path).basename` as the default (correct for clippings/markdown)
2. After setting basename, call `this.getBookFrontmatter()` (already exists at line 531)
3. If frontmatter returns a `title`, override: `this.name = frontmatter.title`
4. Apply same logic in `updatePath()` method (line 297)

This uses the MoonReader frontmatter title as the authoritative name for MoonReader sources, while clippings/markdown sources (which have no MoonReader frontmatter) keep the basename.

## Acceptance Criteria
- [ ] MoonReader books show `frontmatter.title` as deck name (not "Annotations")
- [ ] Clippings/markdown sources still show file basename
- [ ] `updatePath()` uses same name derivation logic
- [ ] Test coverage for both source types with correct names
- [ ] Existing tests pass without changes

## Key Files
- `src/data/models/AnnotationsNote.ts:317` — primary fix (`this.name = ...`)
- `src/data/models/AnnotationsNote.ts:297` — `updatePath()` method
- `src/data/models/AnnotationsNote.ts:531-553` — `getBookFrontmatter()` (reuse)
- `tests/api.test.ts` — integration tests
- `tests/models/annotations.test.ts` — model tests

## Related
- [BUG-006](BUG-006-source-chooser-label-uses-folder-name.md) — original fix that introduced this regression
- [DEBT-006](DEBT-006-disk-business-logic.md) — name derivation belongs in domain model (confirmed by this bug)
