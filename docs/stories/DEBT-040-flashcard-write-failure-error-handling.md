# DEBT-040: Flashcard Write Failure Error Handling

## Status
Ready

## Description

The flashcard mutation chain (FlashcardNote → flashcard-mutations → review-api → UI)
has no error shielding for disk write failures. If `updateCardOnDisk` or
`deleteCardOnDisk` returns `false` (file not found) or throws, the error propagates
as an unhandled promise rejection with no user-visible feedback.

Currently:
- `deleteCard()` and `updateCardContents()`: write result is ignored entirely —
  in-memory state is updated unconditionally even if disk write fails.
- `updateCardSchedule()`: checks the boolean return but doesn't surface failure to
  the user.
- API layer (`review-api.ts`): no try/catch at any call site.

This means a silently failed disk write leaves in-memory state diverged from disk
with no recovery path or user notification.

### Scope

This story covers the error handling strategy only — separate from the `parsedCardStorage`
module refactor (DEBT-007). Decisions to make:

1. **Return convention**: should `parsedCardStorage` helpers throw on failure, or
   return a boolean that callers check?
2. **Caller behavior**: should mutations throw, silently ignore, or return a typed
   Result?
3. **User-visible feedback**: Obsidian `Notice` toast? Error state in UI? Retry?
4. **Recovery**: when write fails, should in-memory state be rolled back or left
   as-is pending a reload?

## Acceptance Criteria
- [ ] Error handling strategy is documented and chosen (throw vs boolean vs Result)
- [ ] FlashcardNote mutations surface write failures to callers consistently
- [ ] API layer has error shielding (try/catch or typed Result) before reaching UI
- [ ] User receives a visible failure notice when a card write fails
- [ ] In-memory state is not updated on write failure (no divergence)
- [ ] Existing tests updated to cover write-failure paths

## Depends on
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md) — parsedCardStorage module
  must exist before error handling can be cleanly centralized

## Related
- [DEBT-006](DEBT-006-disk-business-logic.md) — disk boundary and infrastructure naming
