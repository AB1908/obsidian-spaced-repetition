# DEBT-007: FlashcardNote Persistence Pattern Refactor

## Status
Done

## Epic
None

## Description
`FlashcardNote` holds both domain objects (`flashcards: Flashcard[]`) and storage-state snapshots (`parsedCards: ParsedCard[]`). The `parsedCards` array is a **write-through cache of disk state** — it exists to enable targeted find-and-replace writes instead of regenerating entire files, which was a deliberate choice to avoid file corruption from dirty state and sidestep reindexing.

Every mutation method repeats the same pattern:
1. Find flashcard + parsedCard by ID
2. Generate old storage text via `generateCardAsStorageFormat()`
3. Mutate parsedCard, generate new storage text
4. Call `updateCardOnDisk()` (targeted string replacement), sync in-memory state

This is done **inconsistently** across methods:
- `updateCardContents` mutates `parsedCardCopy.cardText` in place, writes immediately, doesn't check success
- `updateCardSchedule` creates a new object via spread, conditionally syncs state only after `writeSuccessful`
- `deleteCard` generates storage format for the remove, then filters both arrays

### Key Files
- `src/data/models/flashcard.ts` — FlashcardNote class (lines 155-259)
- `src/data/models/parsedCard.ts` — ParsedCard interface + `createParsedCard` (also writes to disk)
- `src/data/utils/TextGenerator.ts` — pure functions: `cardTextGenerator`, `metadataTextGenerator`, `generateCardAsStorageFormat`
- `src/infrastructure/disk.ts` — `updateCardOnDisk`, `deleteCardOnDisk`, `writeCardToDisk`

## Design Analysis

### Design Constraint
The targeted-write strategy (find old text, replace with new text, leave everything else untouched) is intentional. Full-file regeneration risks corruption if in-memory state is dirty. Any refactor must preserve this property.

### Option A: Companion Module (parsedCardStorage.ts)
Extract the write pattern into standalone functions:
```
replaceOnDisk(original: ParsedCard, updated: ParsedCard): Promise<boolean>
removeFromDisk(card: ParsedCard): Promise<void>
appendToDisk(card: ParsedCard): Promise<void>
```

**Pros:**
- Minimal new abstraction, keeps ParsedCard as plain interface
- Pure text generators remain untouched
- FlashcardNote methods shrink to: compute new state -> call helper -> sync in-memory
- Single place to add fingerprint/drift logic later (STORY-010)

**Cons:**
- Still leaves FlashcardNote responsible for knowing about ParsedCard lifecycle
- Doesn't address the question of whether parsedCards should live elsewhere

### Option B: FileSegmentStore (per-file storage object)
A per-file object that owns text snapshots and the targeted-write pattern:
```
FileSegmentStore("Flashcards.md")
  segments: [{id, text}]
  replaceSegment(id, newText) -> targeted disk write
  removeSegment(id) -> targeted disk delete
  appendSegment(text) -> append to file
```

**Pros:**
- Formalizes parsedCards as "what's on disk" — separate from domain objects
- Reusable by AnnotationsNote (also uses `updateCardOnDisk` for targeted writes)
- Natural home for future batching or transaction-like semantics
- FlashcardNote drops `parsedCards[]` entirely, delegates to store

**Cons:**
- Heavier upfront — new class, coordination between FlashcardNote and store
- Possible over-engineering if AnnotationsNote doesn't actually benefit
- Two objects per file (FlashcardNote + store) instead of one

### Option C: Explicit Dirty Tracking
Mark segments as dirty on mutation, flush on demand (e.g., end of review session):
```
store.markDirty(segmentId, newText)
store.flush() -> single file read, apply all replacements, single write
```

**Pros:**
- Batches multiple card updates into one file I/O cycle (e.g., reviewing 10 cards in same file)
- Makes write timing explicit

**Cons:**
- Crash before flush = lost data
- Significantly more complex state management
- Probably premature unless I/O latency becomes measurable problem

## Impact
- Inconsistent write patterns across methods increase bug risk (e.g., state sync after failed write)
- STORY-010 (fingerprinting, drift detection) will add per-write logic — scattered methods multiply the maintenance cost
- `createParsedCard()` in parsedCard.ts also writes to disk, which is a related but separate instance of the same mixing

## Acceptance Criteria
- [ ] Choose one of the three options (or hybrid) at implementation time
- [ ] All FlashcardNote mutation methods use a consistent write pattern
- [ ] State sync (in-memory update) is consistently conditional on write success
- [ ] `createParsedCard` disk write is addressed or noted as follow-up
- [ ] Existing tests pass without changes to test contracts (internal refactor only)

## Testing Note
When implementing this refactor, pilot the integration-test approach: write tests against api.test.ts (final state assertions) rather than adding unit tests for the new module. This addresses the broader question of unit-test maintenance cost vs integration-test confidence (see discussion in source-discovery.test.ts context).

## Related
- [DEBT-006](DEBT-006-disk-business-logic.md) — `updateCardOnDisk` naming and infrastructure boundary
- [DEBT-003](../archive/stories/DEBT-003-parsed-card-api-clarity.md) — createParsedCard API issues
- [DEBT-002](DEBT-002-flashcard-metadata-redundancy.md) — flashcard creation chain
- STORY-010a (content fingerprinting) — will need centralized write-time hook
- STORY-010c (drift detection) — will need stored vs current state comparison
