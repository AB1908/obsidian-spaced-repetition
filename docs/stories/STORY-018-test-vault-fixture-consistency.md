# STORY-018: Dedicated Test Vault for Fixture Consistency

## Status
Backlog

## User Story
As a maintainer, I want a dedicated synthetic test vault for fixture capture, so that fixture and metadata behavior stays consistent without exposing real user content.

## Acceptance Criteria
- [ ] A separate test vault exists for capture flows (not personal vault content).
- [ ] Vault seed content is synthetic and deterministic (no real annotations/quotes).
- [ ] Capture workflow docs define how to refresh fixtures from this vault.
- [ ] Metadata fixtures (`getMetadataForFile*`, related path/index fixtures) are validated for consistency against the test vault baseline.
- [ ] A drift check or checklist exists to detect fixture/schema mismatches after capture updates.

## Context
Current fixture coverage has improved, but metadata and path-related fixture consistency can still drift over time. A dedicated test vault should become the canonical capture source for reproducible tests and safer fixture maintenance.

## Related
- [DEBT-010](DEBT-010-capture-fixture-cycle.md)
- [DEBT-026](../archive/stories/DEBT-026-sanitize-fixture-content.md)
- Guide: `docs/guides/capture-fixtures.md`
