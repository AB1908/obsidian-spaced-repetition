# DEBT-003: createParsedCard API Clarity

## Status
Done

## Description
`createParsedCard()` in `parsedCard.ts` has positional parameters where callers pass explicit `undefined` to reach later optional args (e.g., `flag` is passed as `undefined` in `flashcard.ts:181` to get the default, just to reach `fingerprint`).

The `flag` parameter defaults to `FLAG.LEARNING` with no documented rationale — is this a business rule or a convenience default?

## Impact
- Readability: `createParsedCard(q, a, type, path, id, undefined, fingerprint)` is opaque
- Fragile: adding more optional params worsens the positional problem

## Acceptance Criteria
- [x] Replace trailing optional params with an options object
- [x] Document why default flag is LEARNING

## Related
- [DEBT-002](DEBT-002-flashcard-metadata-redundancy.md) — Flashcard creation chain
