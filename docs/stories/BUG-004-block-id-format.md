# BUG-004: Block IDs Use Wrong Length and Non-Hex Alphabet

## Status
Done

## Description
`addBlockIdsToParagraphs` in `src/api.ts:290` generates block IDs using `nanoid(8)` with the default alphabet (`A-Za-z0-9_-`). Two problems:

1. **Length:** Generates 8-char IDs instead of 6-char. Obsidian's own block IDs are 6 characters.
2. **Alphabet:** Default nanoid includes `_` and `-`. Obsidian reading mode only hides `^blockId` references when the ID uses alphanumeric characters. IDs containing `_` or `-` cause the `^` prefix to remain visible in reading mode.

Note: internal model IDs (flashcard IDs, heading IDs, etc.) can stay at `nanoid(8)` with default alphabet — only disk-written block IDs that appear as `^blockId` in markdown need the fix.

## Acceptance Criteria
- [x] `addBlockIdsToParagraphs` uses 6-char IDs with hex alphabet (`0-9a-f`)
- [x] `^` references are hidden in Obsidian reading mode (needs manual verification)
- [x] Existing block IDs in vault are not affected (backward compatible — only new IDs use new format)

## Related
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md) — introduced the clippings mutation flow
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk.ts boundary concerns
