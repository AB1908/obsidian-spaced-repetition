# STORY-010: Direct Markdown Engagement

## Status
Done

## Epic
None (this is the epic)

## Branch
feat/markdown-source-strategy

## User Story
As a reader, I want to engage directly with markdown notes by selecting paragraphs and creating flashcards, so that I can track "memory coverage" of web articles without leaving the source context.

## Acceptance Criteria
- [x] MarkdownSourceStrategy exists implementing ISourceStrategy
- [x] Paragraphs get fingerprints at parse time
- [x] Fingerprints persisted in flashcard metadata
- [x] Drift detection flags changed paragraphs on reload
- [x] Backward compatibility with existing flashcard metadata

## Sub-Stories
- [STORY-010a](STORY-010a-content-fingerprinting.md) — Content fingerprinting
- [STORY-010b](STORY-010b-markdown-source-strategy.md) — MarkdownSourceStrategy class
- [STORY-010c](STORY-010c-drift-detection.md) — Drift detection on load
- [STORY-011](STORY-011-web-clipping-filter.md) — clipping-aware source signal and discovery
- [STORY-013](STORY-013-markdown-deck-creation-source-chooser.md) — add new deck source chooser UX

## Context
- **ADR:** [ADR-020](../decisions/ADR-020-markdown-source-strategy.md)
- **Feedback tracker items:** LLM-injected structure, Header Tree-UI, abbreviated menu, coverage counters (all out of scope for this epic, tracked in STORY-010 for future)

## Out of Scope
- Abbreviated paragraph selection menu (mobile density)
- LLM-injected structure for flat markdown
- Coverage counter HUD
- Header Tree-UI for articles

## Session Notes
- [2026-02-14](../sessions/2026-02-14-STORY-010.md)
- [2026-02-15](../sessions/2026-02-15-STORY-010.md)
