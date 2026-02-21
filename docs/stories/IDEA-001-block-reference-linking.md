# IDEA-001: Leverage Obsidian Block References for Cross-File Linking

## Description
Obsidian's `[[file#^blockId]]` syntax works for paragraphs we add block IDs to during clippings processing. This opens several possibilities:

- **Flashcard → source linking**: Flashcard notes could reference the exact source paragraph via `[[source#^blockId]]` instead of storing duplicated text
- **Annotation relationships**: If a user has a clipping and wants to create annotations from it, block references could link annotation sections back to specific clipping paragraphs
- **Refactored annotations model**: Instead of the current MoonReader-centric annotation format, a future model could use Obsidian-native block references as the linking mechanism

No strong user requirements currently. Worth revisiting when rethinking the domain model for non-book sources (see DEBT-011).

## Related
- [DEBT-011](../archive/stories/DEBT-011-book-metaphor-clippings.md) — domain model rethink for clippings
- [Guide: Obsidian API Notes](../guides/obsidian-api-notes.md) — block reference behavior documented
