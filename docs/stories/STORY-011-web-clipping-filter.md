# STORY-011: Web Clipping Source Filter

## Status
Backlog

## Epic
None (standalone — may become part of a larger source management epic)

## Branch
TBD

## User Story
As a user, I want only web clippings (not all markdown notes) to be processed by MarkdownSourceStrategy, so that my personal notes aren't treated as flashcard source material.

## Context
Currently `AnnotationsNoteIndex.initialize()` processes all notes with `review/book` or `review/note` tags. MarkdownSourceStrategy would apply to all of these indiscriminately. Web clippings need a distinguishing signal — either a dedicated tag (e.g., `source/web-clipping`), frontmatter field, or folder convention.

## Open Questions
- What signal distinguishes a web clipping from a personal note?
- Should this be a tag, frontmatter property, or folder path?
- Should preprocessing (header cleanup, structure validation) happen before or during strategy selection?
- Does this intersect with ADR-020's "Virtual Chapterization" roadmap item?

## Acceptance Criteria
- [ ] Define filtering mechanism (tag, frontmatter, or folder)
- [ ] MarkdownSourceStrategy only applied to matching notes
- [ ] Other notes continue using existing annotation/callout parsing

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
- [STORY-010b](STORY-010b-markdown-source-strategy.md)
