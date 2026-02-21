# Plan: BUG-007 — Heading Level Strategy for Markdown Sources

**Status:** Approved
**Story:** [BUG-007](../stories/BUG-007-section-list-flattens-heading-levels.md)
**Agent:** Codex 5.3
**Branch:** `fix/heading-level-strategy`

## Code Path (traced)

```
UI calls getBookChapters(bookId) [api.ts:244]
  → book.getNavigableSections() [AnnotationsNote.ts:336]
    → this.strategy.getNavigableSections(this.bookSections)
      → MoonReaderStrategy: filters level === 1 (isChapter) ✓
      → MarkdownSourceStrategy: returns ALL headings ✗ ← BUG
```

Strategy resolution at `AnnotationsNote.ts:340-345`:
- `"moonreader"` (has MoonReader frontmatter) → `MoonReaderStrategy`
- `"direct-markdown"` (clippings tag or no frontmatter) → `MarkdownSourceStrategy`

## Single Point of Change

**File:** `src/data/models/strategies/MarkdownSourceStrategy.ts:31-32`

**Current (broken):**
```typescript
getNavigableSections(sections: BookMetadataSections): Heading[] {
    return sections.filter((section): section is Heading => isHeading(section));
}
```

**Fix (H1-first, H2 fallback):**
```typescript
getNavigableSections(sections: BookMetadataSections): Heading[] {
    const headings = sections.filter((section): section is Heading => isHeading(section));
    const h1s = headings.filter(h => h.level === 1);
    if (h1s.length > 0) return h1s;
    return headings.filter(h => h.level === 2);
}
```

## No Other Files Changed

- `MoonReaderStrategy` unchanged (already filters for `isChapter` / level 1)
- `api.ts:getBookChapters` unchanged (consumes strategy output)
- `ISourceStrategy` interface unchanged (same return type)

## Key References

- Strategy interface: `src/data/models/ISourceStrategy.ts:8`
- Heading type guard: `AnnotationsNote.ts:55-61` (`isHeading`, `isChapter`)
- Existing `getBookChapters` tests: `tests/api.test.ts:474-492`

## Test Plan

Add test block in `tests/api.test.ts` near existing `getBookChapters` tests:

| Scenario | Fixture Headings | Expected Result |
|----------|-----------------|-----------------|
| Mixed H1+H2+H3 | `[{h:"A",l:1},{h:"B",l:1},{h:"C",l:2},{h:"D",l:3}]` | Only H1s: A, B |
| Only H2 | `[{h:"X",l:2},{h:"Y",l:2},{h:"Z",l:3}]` | Only H2s: X, Y |
| No headings | `[]` | Empty array |
| MoonReader unchanged | existing fixtures | Only level 1 (regression check) |

New fixtures needed: 3 `getMetadataForFile_*.json` files with heading configurations matching the test scenarios above. Follow existing fixture format (see `getMetadataForFile_constitution.json` for shape).

## Verification

```bash
npm test -- api.test
npm test  # full suite
```
