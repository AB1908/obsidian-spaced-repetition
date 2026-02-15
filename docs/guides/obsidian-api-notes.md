# Obsidian API Notes

Durable reference for Obsidian API quirks, gotchas, and undocumented behavior discovered during development.

## 2026-02-15: frontmatter.tags can be a string

`CachedMetadata.frontmatter.tags` returns a **string** (not array) when YAML uses inline form:
```yaml
tags: review/book
```

vs array form:
```yaml
tags:
  - review/book
```

Always normalize with `Array.isArray()` before iterating. See [BUG-003](../stories/BUG-003-filetags-string-tags-crash.md).

## 2026-02-15: Block references work cross-file with wiki-links

Obsidian `[[file#^blockId]]` syntax works for paragraphs with `^blockId` suffixes, even for files we mutate (adding block IDs to clippings). The reference resolves correctly in both editing and reading mode.

This means block IDs we add to clippings paragraphs are first-class Obsidian citizens — they can be linked from other files, and Obsidian's link resolution handles renames.

Potential future uses:
- Auto-linking between flashcard notes and source paragraphs
- Creating annotation relationships across files
- Refactoring annotations to use block reference links instead of duplicated text

See [IDEA-001](../stories/IDEA-001-block-reference-linking.md).

## 2026-02-15: Block ID format requirements for reading mode

Obsidian reading mode only hides `^blockId` when the ID uses alphanumeric characters (`A-Za-z0-9`). IDs containing `_` or `-` (default nanoid alphabet) cause the `^` prefix to remain visible. See [BUG-004](../stories/BUG-004-block-id-format.md).
