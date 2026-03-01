# DEBT-040: Flashcard Write Failure Error Handling

## Status
Ready

## Description

The flashcard mutation chain (`FlashcardNote` → `parsedCardStorage` → `infrastructure/disk` → UI) has inconsistent error shielding for disk write failures. `parsedCardStorage.ts` now exists (DEBT-007 done) and wraps `updateCardOnDisk` and `deleteCardOnDisk` as `replaceCardOnDisk` and `removeCardFromDisk`, returning `Promise<boolean>`. However, how callers handle a `false` return or a thrown error is inconsistent.

### Current Behavior per Mutation

**`deleteCard()`** in `src/data/models/flashcard.ts`:
```ts
const writeSuccessful = await removeCardFromDisk(parsedCard);
if (writeSuccessful === false) return;  // silently returns without updating in-memory state
```
If write fails, in-memory state is NOT updated — this is correct. However, no error or notice is surfaced to the caller or user.

**`updateCardContents()`** in `src/data/models/flashcard.ts`:
```ts
const writeSuccessful = await replaceCardOnDisk(originalParsedCard, updatedParsedCard);
if (writeSuccessful === false) return;  // silently returns
```
Same pattern: correct in-memory guard, no user feedback.

**`updateCardSchedule()`** in `src/data/models/flashcard.ts`:
```ts
const writeSuccessful = await replaceCardOnDisk(parsedCardCopy, updatedParsedCard);
if (writeSuccessful) {
    // update parsedCards and flashcard state
}
```
Only updates in-memory state on success — consistent. Still no user feedback.

**`createFlashcardForAnnotation()`** in `src/data/models/annotations-note/flashcard-mutations.ts`:
Calls `updateCardOnDisk` directly (not via `parsedCardStorage`) to inject block IDs for paragraphs. The return value is ignored entirely.

**Review API layer (`src/application/review-api.ts`):**
No try/catch at any call site. Unhandled thrown errors from `removeCardFromDisk` or `replaceCardOnDisk` will propagate as unhandled promise rejections with no user-visible feedback.

### Scope

This story covers the error handling strategy only. Decisions to make:

1. **Return convention**: should write failure surface as a thrown error or a `false` boolean? Currently mixed — `parsedCardStorage` returns `boolean`, `createFlashcardForAnnotation` ignores the return value.
2. **Caller behavior**: should mutations throw, silently ignore, or return a typed Result?
3. **User-visible feedback**: Obsidian `Notice` toast? Error state in UI?
4. **Recovery**: when write fails, in-memory state is currently guarded on most paths — but `createFlashcardForAnnotation` block-ID injection is not guarded.

## Acceptance Criteria
- [ ] Error handling strategy is documented and chosen (throw vs boolean vs Result)
- [ ] `FlashcardNote` mutations surface write failures to callers consistently
- [ ] `createFlashcardForAnnotation` block-ID injection handles `updateCardOnDisk` return value
- [ ] API layer (`review-api.ts`, `annotation-api.ts`) has error shielding (try/catch or typed Result) before reaching UI
- [ ] User receives a visible failure notice when a card write fails
- [ ] In-memory state is not updated on write failure (current behavior mostly correct, verify `createFlashcardForAnnotation` path)
- [ ] Existing tests updated to cover write-failure paths

## Depends on
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md) — `parsedCardStorage` module must exist before error handling can be cleanly centralized (now Done: see `src/data/utils/parsedCardStorage.ts`)

## Likely Touchpoints
- `src/data/models/flashcard.ts` — `deleteCard()`, `updateCardContents()`, `updateCardSchedule()` in `FlashcardNote`
- `src/data/models/annotations-note/flashcard-mutations.ts` — `createFlashcardForAnnotation()` (ignores block-ID write result)
- `src/data/utils/parsedCardStorage.ts` — `replaceCardOnDisk()`, `removeCardFromDisk()`, `appendCardToDisk()`
- `src/infrastructure/disk.ts` — `updateCardOnDisk()`, `deleteCardOnDisk()` (return `boolean`)
- `src/application/review-api.ts` — `deleteFlashcard()`, `updateFlashcardSchedulingMetadata()` (no error shielding)
- `src/application/annotation-api.ts` — `createFlashcardForAnnotation()`, `updateFlashcardContentsById()` (no error shielding)
- `src/infrastructure/obsidian-facade.ts` — `ObsidianNotice` (mechanism for user-visible feedback)

## Related
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk boundary and infrastructure naming
