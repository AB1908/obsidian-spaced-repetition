# DEBT-004: MarkdownSourceStrategy Tight Coupling to Obsidian Internals

## Status
Done

## Description
`MarkdownSourceStrategy.extract()` directly accesses `metadata.sections`, filters by `s.type === "paragraph"`, and reads `s.position.start.line` / `s.position.end.line`. This tightly couples the strategy to Obsidian's `CachedMetadata` structure.

The same pattern exists in `bookSections()` (AnnotationsNote.ts:92-129) — both implementations duplicate the section-type branching and text extraction logic.

## Impact
- If Obsidian changes its metadata format, multiple locations break
- Strategy pattern loses value when the strategy knows too much about infrastructure
- Duplicate extraction logic between bookSections() and MarkdownSourceStrategy

## Acceptance Criteria
- [ ] Extract section-walking logic into a shared helper (e.g., `extractSectionsFromCache()`)
- [ ] Strategy delegates to helper rather than directly consuming CachedMetadata
- [ ] bookSections() also uses the shared helper

## Related
- [STORY-010b](STORY-010b-markdown-source-strategy.md)
- [DEBT-001](DEBT-001-inconsistent-data-models.md) — section type handling
