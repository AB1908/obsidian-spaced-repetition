# STORY-010b: MarkdownSourceStrategy

## Status
Done

## Epic
[STORY-010](STORY-010-markdown-engagement.md)

## Branch
feat/markdown-source-strategy

## Depends on
- [STORY-010a](STORY-010a-content-fingerprinting.md) — fingerprint infra needed first

## User Story
As a developer, I want a formal MarkdownSourceStrategy implementing ISourceStrategy, so that markdown-based sources follow the same strategy pattern as MoonReader.

## Acceptance Criteria
- [ ] `MarkdownSourceStrategy` class implements `ISourceStrategy`
- [ ] `extract()` delegates to Obsidian metadata cache (not hand-parsing)
- [ ] Exported from `src/data/models/index.ts`

## Tasks
- [ ] Create `src/data/models/strategies/MarkdownSourceStrategy.ts`
- [ ] `extract()` uses `getMetadataForFile()` + `getFileContents()` from disk abstraction
- [ ] Add export to `src/data/models/index.ts`

## Related
- ADR: [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
- Existing: [MoonReaderStrategy](../../src/data/models/strategies/MoonReaderStrategy.ts)
