# DEBT-006: Business Logic Mixed into Infrastructure Layer (disk.ts)

## Status
Ready

## Epic
None

## Description
`src/infrastructure/disk.ts` is intended as a thin Obsidian vault facade, but several functions contain business logic that should live in the data/model layer. This item catalogues the offenders for future extraction.

### Functions with Business Logic

| Function | Business Logic | Infrastructure |
|----------|---------------|----------------|
| `generateFlashcardsFileNameAndPath` | Path naming strategy: uses folder name for nested files, original filename for root-level. Has existing TODO comment acknowledging this. | Accesses `TFile.parent` |
| `createFlashcardsFileForBook` | YAML frontmatter template generation, hardcoded `flashcards` tag, wiki-link construction back to source. Has existing TODO comment. | `vault.create()` |
| `getAnnotationFilePath` | Resolves `[[wiki-link]]` syntax from YAML `annotations` key to actual file path | Metadata cache lookup |
| `fileTags` / `filePathsWithTag` | Tag transformation (strips `#`), merges frontmatter + inline tags, hash-based caching orchestration | Metadata cache iteration |
| `getParentOrFilename` | Decision logic: return parent folder name OR filename based on nesting | `TFile` property access |

### Naming Issue

`updateCardOnDisk(path, originalText, updatedText)` is semantically `replaceTextInFile` — it reads the full file, does `string.replace(original, updated)`, writes back. The "card" framing leaks domain concepts into infrastructure. Same function is used by both FlashcardNote and AnnotationsNote for targeted text replacement.

### Overlap Analysis

`updateCardOnDisk` and `overwriteFile` both call `vault.modify()` but serve different purposes:
- `updateCardOnDisk`: targeted segment replacement (find-and-replace)
- `overwriteFile`: full file replacement

No functional overlap, but the naming makes `updateCardOnDisk` seem card-specific when it's generic.

## Impact
- Infrastructure layer accumulates domain knowledge, making it harder to reason about boundaries
- Functions like `generateFlashcardsFileNameAndPath` can't be tested without mocking Obsidian internals
- `updateCardOnDisk` naming misleads about scope — it's used beyond cards

## Acceptance Criteria
- [ ] Catalogue reviewed and confirmed complete
- [ ] Each function has a proposed destination (which model/service should own the logic)
- [ ] Extraction plan accounts for test impact

## Related
- [DEBT-005](../archive/stories/DEBT-005-source-discovery-policy-boundary.md) — established the principle that disk.ts should be infrastructure-only
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md) — related refactor of the targeted-write pattern
