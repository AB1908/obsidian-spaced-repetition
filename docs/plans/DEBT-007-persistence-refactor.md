# Plan: DEBT-007 — FlashcardNote Persistence Pattern Refactor

**Story:** [DEBT-007](../stories/DEBT-007-flashcard-persistence-pattern.md)
**Agent:** Claude Code (architecture-sensitive)
**Branch:** `refactor/flashcard-persistence`

## Decision: Option A (Companion Module)

## Current Inconsistencies (traced)

| Method | Mutation Style | Write Check | State Sync |
|--------|---------------|-------------|------------|
| `deleteCard()` | Filter arrays | None | Unconditional ✗ |
| `updateCardContents()` | Mutates reference in-place | None | Unconditional ✗ |
| `updateCardSchedule()` | Immutable spread copy | `writeSuccessful` check | Conditional ✓ |
| `createCard()` | `createParsedCard` owns write | None in caller | Unconditional ✗ |

**Risk:** If disk write fails in `deleteCard()` or `updateCardContents()`, in-memory state diverges from disk. User reviews stale data next session.

## New File: `src/data/utils/parsedCardStorage.ts` (~45 lines)

Three pure functions wrapping disk operations with semantic naming:

```typescript
import { generateCardAsStorageFormat } from "src/data/utils/TextGenerator";
import { updateCardOnDisk, deleteCardOnDisk, writeCardToDisk } from "src/infrastructure/disk";
import { ParsedCard } from "src/data/models/parsedCard";

// Targeted find-and-replace on disk
export async function replaceCardOnDisk(
    original: ParsedCard, updated: ParsedCard
): Promise<boolean> {
    const originalText = generateCardAsStorageFormat(original);
    const updatedText = generateCardAsStorageFormat(updated);
    return updateCardOnDisk(original.notePath, originalText, updatedText);
}

// Targeted removal from file
export async function removeCardFromDisk(card: ParsedCard): Promise<boolean> {
    const text = generateCardAsStorageFormat(card);
    return deleteCardOnDisk(card.notePath, text);
}

// Append new card to file
export async function appendCardToDisk(card: ParsedCard): Promise<void> {
    const text = generateCardAsStorageFormat(card);
    await writeCardToDisk(card.notePath, text);
}
```

## Refactored Methods in `src/data/models/flashcard.ts`

### `deleteCard()` (lines ~188-205)
```typescript
async deleteCard(flashcardId: string) {
    const flashcard = this.flashcards.find(t => t.id === flashcardId);
    if (!flashcard) throw new Error(`Flashcard not found: ${flashcardId}`);
    const parsedCard = this.parsedCards.find(t => t.id === flashcard.parsedCardId);
    if (!parsedCard) throw new Error(`Parsed card not found: ${flashcardId}`);

    const writeSuccessful = await removeCardFromDisk(parsedCard);  // NEW
    if (!writeSuccessful) throw new Error(`Failed to delete from disk: ${flashcardId}`);

    this.flashcards = this.flashcards.filter(t => t.id !== flashcardId);        // CONDITIONAL
    this.parsedCards = this.parsedCards.filter(t => t.id !== flashcard.parsedCardId);
}
```

### `updateCardContents()` (lines ~207-235)
```typescript
async updateCardContents(flashcardId: string, question: string, answer: string, cardType: CardType) {
    const flashcard = this.flashcards.find(t => t.id === flashcardId);
    if (!flashcard) throw new Error(`Flashcard not found: ${flashcardId}`);
    const originalParsedCard = this.parsedCards.find(t => t.id === flashcard.parsedCardId);
    if (!originalParsedCard) throw new Error(`Parsed card not found: ${flashcardId}`);

    const updatedParsedCard = {                               // IMMUTABLE COPY (was: in-place mutation)
        ...originalParsedCard,
        cardText: cardTextGenerator(question, answer, cardType)
    };

    const writeSuccessful = await replaceCardOnDisk(originalParsedCard, updatedParsedCard);  // NEW
    if (!writeSuccessful) throw new Error(`Failed to update on disk: ${flashcardId}`);

    const parsedIndex = this.parsedCards.findIndex(t => t.id === originalParsedCard.id);
    if (parsedIndex !== -1) this.parsedCards[parsedIndex] = updatedParsedCard;  // CONDITIONAL
    flashcard.questionText = question;
    flashcard.answerText = answer;
}
```

### `updateCardSchedule()` — NO CHANGE
Already uses immutable copy + conditional sync. Just update import to use `replaceCardOnDisk`.

### `createCard()` — MINIMAL CHANGE
Update `src/data/models/parsedCard.ts` to use `appendCardToDisk()` instead of direct `writeCardToDisk()` call. Vocabulary alignment only. Full decoupling deferred to DEBT-003.

## Consistent Pattern (all methods now follow)

1. Find flashcard + parsedCard by ID (throw if missing)
2. Create immutable spread copy of parsedCard with mutations
3. Call `parsedCardStorage` function → get boolean result
4. **Only if successful:** update in-memory arrays and flashcard fields
5. **On failure:** throw (state unchanged, user can retry)

## Test Impact: None

All existing integration tests in `api.test.ts` pass without changes:
- Fixtures mock the same underlying disk functions (`updateCardOnDisk`, `deleteCardOnDisk`, `writeCardToDisk`)
- `replaceCardOnDisk` and `removeCardFromDisk` delegate to those same mocked functions
- No new unit tests needed (per story testing note: pilot integration-test approach)

Relevant existing fixtures:
- `updateCardOnDisk_2025-12-25T10-00-00_aaaaa.json`
- `updateCardOnDisk_2025-12-25T10-00-01_bbbbb.json`
- `deleteCardOnDisk.json`
- `writeCardToDisk.json`

## Implementation Checklist

- [ ] Create `src/data/utils/parsedCardStorage.ts` (~45 lines)
- [ ] Refactor `deleteCard()` — check write success before array sync
- [ ] Refactor `updateCardContents()` — immutable copy + conditional sync
- [ ] Update `updateCardSchedule()` — use `replaceCardOnDisk` import (behavior unchanged)
- [ ] Update `parsedCard.ts` — use `appendCardToDisk()`
- [ ] `npm test` passes with zero fixture/test changes
- [ ] Note DEBT-003 follow-up for full `createParsedCard` decoupling

## Verification

```bash
npm test  # all 31 suites pass, zero fixture changes
npm run build  # clean build
```
