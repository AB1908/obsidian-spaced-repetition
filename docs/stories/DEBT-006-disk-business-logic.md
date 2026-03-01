# DEBT-006: Business Logic Mixed into Infrastructure Layer (disk.ts)

## Status
Ready

## Epic
None

## Description
`src/infrastructure/disk.ts` is intended as a thin Obsidian vault facade, but several functions contain business logic that should live in the application or domain layer. The file moved from `src/data/disk.ts` to `src/infrastructure/disk.ts` during a prior refactor, but its internal content was not cleaned up in that move. This item catalogues the remaining offenders.

### Functions with Business Logic

| Function | Business Logic | Infrastructure |
|----------|---------------|----------------|
| `generateFlashcardsFileNameAndPath` | Path naming strategy: uses folder name for nested files, original filename for root-level. Has existing TODO comment acknowledging this. | Accesses `TFile.parent` |
| `createFlashcardsFileForBook` | YAML frontmatter template generation, hardcoded `flashcards` tag, wiki-link construction back to source. Has existing TODO comment. | `vault.create()` |
| `getAnnotationFilePath` | Resolves `[[wiki-link]]` syntax from YAML `annotations` key to actual file path | Metadata cache lookup |
| `fileTags` / `filePathsWithTag` | Tag transformation (strips `#`), merges frontmatter + inline tags, hash-based caching orchestration | Metadata cache iteration |
| `getParentFolderPathAndName` | Decision logic: return parent folder name OR path based on nesting | `TFile` property access |

### Naming Issue

`updateCardOnDisk(path, originalText, updatedText)` is semantically `replaceTextInFile` — it reads the full file, does `string.replace(original, updated)`, writes back. The "card" framing leaks domain concepts into infrastructure. The same function is used by both `FlashcardNote` (via `parsedCardStorage.ts`) and `AnnotationsNote` (via `annotation-persistence.ts`) for targeted text replacement.

`parsedCardStorage.ts` at `src/data/utils/parsedCardStorage.ts` wraps `updateCardOnDisk` and `deleteCardOnDisk` with card-specific helpers (`replaceCardOnDisk`, `removeCardFromDisk`, `appendCardToDisk`) — this was the DEBT-007 extraction. However, the underlying naming in `disk.ts` is still card-flavoured.

### Overlap Analysis

`updateCardOnDisk` and `overwriteFile` both call `vault.modify()` but serve different purposes:
- `updateCardOnDisk`: targeted segment replacement (find-and-replace within file)
- `overwriteFile`: full file replacement

No functional overlap, but the naming makes `updateCardOnDisk` seem card-specific when it is a generic text-replacement utility.

## Impact
- Infrastructure layer accumulates domain knowledge (YAML templates, path naming policy), making boundaries harder to reason about
- Functions like `generateFlashcardsFileNameAndPath` can't be unit-tested without mocking Obsidian internals
- `updateCardOnDisk` naming misleads about scope — it is used by both card writes and annotation writes

## Acceptance Criteria
- [ ] Catalogue reviewed and confirmed complete
- [ ] Each function has a proposed destination (which model/service should own the logic)
- [ ] Extraction plan accounts for test impact

## Likely Touchpoints
- `src/infrastructure/disk.ts` — all functions listed above
- `src/data/models/annotations-note/AnnotationsNote.ts` — calls `generateFlashcardsFileNameAndPath`, `createFlashcardsFileForBook`
- `src/data/models/annotations-note/annotation-persistence.ts` — calls `updateCardOnDisk`
- `src/data/models/annotations-note/flashcard-mutations.ts` — calls `updateCardOnDisk`
- `src/data/models/flashcard.ts` — calls `getAnnotationFilePath`, `filePathsWithTag`
- `src/data/utils/parsedCardStorage.ts` — wraps `updateCardOnDisk`, `deleteCardOnDisk`, `writeCardToDisk`
- `src/application/deck-creation-helpers.ts` — calls `getMetadataForFile`, `getFileContents`, `overwriteFile`, `moveFile`, `ensureFolder`

## Related
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md) — related refactor of the targeted-write pattern (now Done: see `src/data/utils/parsedCardStorage.ts`)
- [DEBT-040](DEBT-040-flashcard-write-failure-error-handling.md) — error handling for disk write failures
