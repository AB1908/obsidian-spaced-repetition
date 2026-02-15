# DEBT-005: Move Source Discovery Policy to App Layer

## Status
Done

## Epic
None

## Branch
feat/markdown-source-strategy

## Description
Source eligibility policy is currently coupled to model initialization (`AnnotationsNoteIndex.initialize`) with hardcoded tag rules. This mixes product policy ("which files are eligible for deck creation/review") with model bootstrapping.

We need an app-layer policy boundary so discovery remains extensible for new source types while keeping parsing strategies focused on extraction/sync behavior.

## Impact
- Current placement increases coupling and makes policy changes risky
- Harder to support configurable source rules later (settings-driven tags/folders)
- Easier for strategy/model layers to accumulate business policy by accident

## Acceptance Criteria
- [x] Introduce a dedicated app-layer source discovery policy function/service (single source of truth)
- [x] `disk.ts` remains infrastructure-only (file access + metadata access), not product policy
- [x] `ISourceStrategy` implementations remain extraction/sync-only, no eligibility logic
- [x] `AnnotationsNoteIndex.initialize` consumes candidate paths from app-layer policy instead of hardcoding tag rules
- [x] Tests cover policy behavior for `review/book`, `review/note`, and `clippings` tag combinations
- [x] Document performance tradeoff and constraints (indexed metadata first, avoid full parse for non-candidates)

## Tasks
- [x] Define source-candidate contract (path + tags + lightweight metadata)
- [x] Implement app-layer candidate selector and migrate existing tag checks
- [x] Update index initialization to use selector output
- [x] Add focused tests around inclusion/exclusion policy
- [x] Add notes for future settings-driven configurability

## Session Notes
- First implementation can still be tag-first and performance-oriented.
- Goal is boundary correctness and extensibility, not immediate general configurability.
- Accept potential short-term test churn while preserving behavior.
- 2026-02-15: Added `src/data/source-discovery.ts` and replaced hardcoded tag filtering in `AnnotationsNoteIndex`.

## Related
- [STORY-011](STORY-011-web-clipping-filter.md)
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md)
- [DEBT-004](DEBT-004-strategy-coupling.md)
- ADR: [ADR-018](../decisions/ADR-018-source-model-architecture.md)
