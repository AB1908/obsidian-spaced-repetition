# STORY-018: Dedicated Test Vault for Fixture Consistency

## Status
Done

## Reviewed
No

## User Story
As a maintainer, I want a dedicated synthetic test vault for fixture capture, so that fixture and metadata behavior stays consistent without exposing real user content.

## Acceptance Criteria
- [x] A separate test vault exists for capture flows (`tests/vault/`).
- [x] Vault seed content is synthetic and deterministic (lorem ipsum, no real annotations/quotes).
- [x] Capture workflow docs define how to refresh fixtures from this vault (`docs/guides/capture-fixtures.md` — Test Vault section).
- [x] All fixtures (`getFileContents`, `getMetadataForFile`, etc.) are captured from real Obsidian using the vault as source — no synthesis. Ensures `getFileContents` and `getMetadataForFile` come from the same capture session, keeping byte offsets consistent.
- [x] A drift check exists: `npm run vault:check` compares vault `.md` file content against captured `getFileContents` fixture output. Pre-commit hook enforces sync when vault files are staged.

## Context
Phase A: vault as re-capture source only. All fixtures remain Obsidian-captured.

Phase B (separate story): shift mock seam from `disk.ts` to `obsidian-facade.ts` so
`disk.ts` is exercised in tests rather than bypassed entirely.

## Related
- [DEBT-010](DEBT-010-capture-fixture-cycle.md)
- Guide: `docs/guides/capture-fixtures.md`
