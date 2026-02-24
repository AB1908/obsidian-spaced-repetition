# Plan: DEBT-007 — FlashcardNote Persistence Pattern Refactor

## Goal

Make all `FlashcardNote` mutation methods consistent: immutable state copy, conditional
state sync on write success. Extract the repeated write pattern into a companion module
`parsedCardStorage.ts` — a single place to add fingerprint/drift logic later (STORY-010).

---

## Design Decisions

### 1. Option selection: A (companion module) vs B (FileSegmentStore) vs C (dirty tracking)

**Chosen: A — companion module (`parsedCardStorage.ts`).**

Research confirmed:
- `ParsedCard` is a write-through cache for targeted disk writes, not a general domain object.
  Any abstraction must preserve the targeted find-and-replace property.
- `AnnotationsNote` does not share the same write pattern, so a shared `FileSegmentStore`
  (Option B) has no second consumer and would be premature.
- Dirty-tracking (Option C) introduces crash-before-flush data loss — unacceptable for a
  study tool.
- Option A adds one file, ~30 lines, zero test changes, zero breaking changes. It creates
  the natural insertion point for STORY-010 fingerprint hooks.

---

### 2. Error handling on write failure

**Options:**
- **A — Throw on failure**: caller gets a visible error; no silent divergence
- **B — Return boolean and let caller decide**: more flexible, shifts burden to callers

**Chosen: A — throw on failure.**

`deleteCard` and `updateCardContents` currently have no error path at all (unconditional
state sync regardless of disk outcome). Introducing throws is a strict improvement.
`updateCardSchedule` already uses conditional sync — align by making failure explicit
everywhere. Upper layers (API, UI) can catch and surface errors.

---

### 3. `createParsedCard` disk write

`createParsedCard` in `parsedCard.ts` calls `writeCardToDisk` directly (mixed concern).
DEBT-003 tracks the full decoupling. In this refactor: update to call `appendCardToDisk`
from `parsedCardStorage.ts` for vocabulary consistency, but do not restructure the
function signature or responsibility boundary.

---

## Implementation

### New file: `src/data/utils/parsedCardStorage.ts`

```typescript
import { generateCardAsStorageFormat } from "src/data/utils/TextGenerator";
import { updateCardOnDisk, deleteCardOnDisk, writeCardToDisk } from "src/infrastructure/disk";
import type { ParsedCard } from "src/data/models/parsedCard";

/**
 * Targeted find-and-replace for an existing card on disk.
 * Throws if the file is not found or the write fails.
 */
export async function replaceCardOnDisk(original: ParsedCard, updated: ParsedCard): Promise<void> {
    const originalText = generateCardAsStorageFormat(original);
    const updatedText = generateCardAsStorageFormat(updated);
    const ok = await updateCardOnDisk(original.notePath, originalText, updatedText);
    if (!ok) throw new Error(`replaceCardOnDisk: file not found: ${original.notePath}`);
}

/**
 * Targeted removal of a card from disk.
 * Throws if the file is not found.
 */
export async function removeCardFromDisk(card: ParsedCard): Promise<void> {
    const text = generateCardAsStorageFormat(card);
    const ok = await deleteCardOnDisk(card.notePath, text);
    if (!ok) throw new Error(`removeCardFromDisk: file not found: ${card.notePath}`);
}

/**
 * Append a new card to the end of a file on disk.
 */
export async function appendCardToDisk(card: ParsedCard): Promise<void> {
    const text = generateCardAsStorageFormat(card);
    await writeCardToDisk(card.notePath, text);
}
```

### Changes to `src/data/models/flashcard.ts`

#### `deleteCard()` — add conditional sync

```typescript
// Before
const text = generateCardAsStorageFormat(parsedCard);
await deleteCardOnDisk(this.path, text);
this.flashcards = this.flashcards.filter(...);
this.parsedCards = this.parsedCards.filter(...);

// After
await removeCardFromDisk(parsedCard);  // throws on failure
this.flashcards = this.flashcards.filter(...);
this.parsedCards = this.parsedCards.filter(...);
```

#### `updateCardContents()` — immutable copy + conditional sync

```typescript
// Before: in-place mutation + no write-success check
const parsedCardCopy = this.parsedCards.find(...);
const originalCardAsStorageFormat = generateCardAsStorageFormat(parsedCardCopy);
parsedCardCopy.cardText = cardTextGenerator(...);  // mutates array element
const updatedCardAsStorageFormat = generateCardAsStorageFormat(parsedCardCopy);
await updateCardOnDisk(parsedCardCopy.notePath, originalCardAsStorageFormat, updatedCardAsStorageFormat);
flashcard.questionText = question;
flashcard.answerText = answer;

// After: immutable + throws on failure
const originalParsedCard = this.parsedCards.find(...);
const updatedParsedCard = { ...originalParsedCard, cardText: cardTextGenerator(question, answer, cardType) };
await replaceCardOnDisk(originalParsedCard, updatedParsedCard);  // throws on failure
const parsedIndex = this.parsedCards.findIndex(t => t.id === originalParsedCard.id);
if (parsedIndex !== -1) this.parsedCards[parsedIndex] = updatedParsedCard;
flashcard.questionText = question;
flashcard.answerText = answer;
```

#### `updateCardSchedule()` — update import only

Already has the correct pattern (immutable spread, conditional sync). Update to use
`replaceCardOnDisk` in place of the raw `updateCardOnDisk` call:

```typescript
// Before
const writeSuccessful = await updateCardOnDisk(parsedCardCopy.notePath, originalText, updatedText);
if (writeSuccessful) { ... }

// After
await replaceCardOnDisk(parsedCardCopy, updatedParsedCard);  // throws on failure
// state sync is unconditional here since throw = no sync
const parsedIndex = ...
this.parsedCards[parsedIndex] = updatedParsedCard;
flashcard.dueDate = ...
```

Note: `updateCardSchedule` currently uses `if (writeSuccessful)` with a boolean return.
After migration to `replaceCardOnDisk` (which throws), the conditional becomes a
try/catch at the call site if needed, or the throw propagates naturally. Align with
the throw pattern to be consistent.

### Changes to `src/data/models/parsedCard.ts`

In `createParsedCard`, replace:
```typescript
await writeCardToDisk(parsedCard.notePath, generateCardAsStorageFormat(parsedCard));
```
with:
```typescript
await appendCardToDisk(parsedCard);
```

---

## Commit sequence

1. **`refactor(flashcard): unify persistence pattern via parsedCardStorage module`**
   - `src/data/utils/parsedCardStorage.ts` (new)
   - `src/data/models/flashcard.ts`
   - `src/data/models/parsedCard.ts`
   - All tests green, no fixture changes

---

## Verification gates

- `npm test -- --testPathPattern="flashcard|api"` passes
- `npm test` (full suite) passes — zero fixture changes expected
- `npm run build` exits 0

## Delegation

```bash
scripts/delegate-codex-task.sh \
  --branch debt-007-flashcard-persistence-pattern \
  --base main \
  --scope-file docs/plans/DEBT-007-flashcard-persistence-pattern.md \
  --test-contract docs/plans/DEBT-007-flashcard-persistence-pattern-test-contract.md \
  --log-file docs/executions/logs/debt-007-flashcard-persistence-pattern.log \
  --semantic-log docs/executions/semantic/debt-007-flashcard-persistence-pattern.md \
  --execute
```
