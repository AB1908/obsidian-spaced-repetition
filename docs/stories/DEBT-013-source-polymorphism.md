# DEBT-013: Source Polymorphism — Markdown vs MoonReader Annotation Exports

## Status
Backlog

## Description

The plugin now has two distinct source types that share the `AnnotationsNote` model:

1. **MoonReader annotation exports** (`review/book` tag) — original use case. The file is a structured export with chapters and annotations. A separate flashcard note is created as a sidecar.
2. **Direct markdown sources** (`clippings` tag) — new use case. The file is a regular markdown note with headings and paragraphs. Block IDs are injected, the file is moved to its own folder, and a flashcard note is created.

These have different behaviors at multiple layers:

### Mutation at deck creation
- MoonReader sources: no mutation needed, file structure is already stable
- Markdown sources: `addBlockIdsToParagraphs` injects `^blockId` into paragraphs, `ensureDirectMarkdownSourceInOwnFolder` moves the file. Both of these live in `api.ts` as free functions — they have no home in the domain model.

### Block ID generation
- `addBlockIdsToParagraphs` generates hex block IDs (`customAlphabet("0123456789abcdef", 6)`) for Obsidian reading mode compatibility. This is currently a module-level constant in `api.ts`. It should belong to whatever owns markdown source mutation.

### Model identity
- `AnnotationsNote` serves both source types identically. It has `bookSections`, references "chapters" and "annotations" — vocabulary that fits MoonReader but not markdown.
- `source-discovery.ts` distinguishes between source types (`direct-markdown` vs `review/book`) but `AnnotationsNote` doesn't — it's the same class either way.
- The `frontbook` interface name leaks the book metaphor into the type system.

### Where things break
- After creating a deck from a markdown source, the chapters/annotations navigation shows nothing (DEBT-011) — because the book-shaped API doesn't match the markdown-shaped content.
- `addBlockIdsToParagraphs` reads raw file contents and metadata — it's doing markdown source mutation but lives in the orchestration layer.

### The hard question
Should there be a `Source` abstraction with markdown and annotation-export variants? Or should `AnnotationsNote` become more generic? The tradeoffs:

- **Polymorphic Source**: Clean separation, each variant owns its mutation/parsing/navigation logic. Risk: over-engineering if the variants converge.
- **Generic AnnotationsNote**: Less code, one model to maintain. Risk: grows into a god class with conditionals everywhere.
- **Strategy pattern on AnnotationsNote**: Middle ground — same class, swappable behaviors for mutation, parsing, navigation. Risk: indirection without clarity.

No strong recommendation yet. Needs tradeoff analysis with concrete examples from both code paths.

## Acceptance Criteria
- [ ] Analyse both source paths end-to-end (creation, parsing, navigation, flashcard generation)
- [ ] Document where behavior diverges and where it converges
- [ ] Propose model design with tradeoff analysis
- [ ] Consider migration path for existing vault data

## Related
- [DEBT-011](DEBT-011-book-metaphor-clippings.md) — UI/route side of the book metaphor problem
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk.ts boundary (related extraction targets)
- [BUG-004](BUG-004-block-id-format.md) — block ID generation, currently homeless in api.ts
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md) — introduced the markdown source path
