# Plan: DEBT-026 Fixture Sanitization

**Story:** `docs/stories/DEBT-026-sanitize-fixture-content.md`  
**Date:** 2026-02-17  
**Priority:** P1

## Objective
Eliminate real user annotations and real quoted book/web content from test fixtures by replacing free-text payloads with deterministic dummy text (lorem ipsum style), while preserving fixture usability for tests.

## Non-Negotiable Rules
1. No real annotation prose remains in fixture payloads.
2. No real quoted source prose remains in fixture payloads.
3. Replacement text must be deterministic and synthetic (lorem/dummy corpus only).
4. Fixture structure used by tests must remain valid.

## Scope
- Primary: all `tests/fixtures/getFileContents_*.json`
- Secondary: any other fixture fields carrying long-form free text from captured content
- Excluded: method names and structural JSON keys

## Implementation Strategy
1. Add a deterministic sanitizer script to transform fixture payload text.
2. Replace free text in targeted fixture outputs with synthetic lorem/dummy text.
3. Preserve markdown and metadata shape required by parser/tests:
   - frontmatter block shape
   - callout markers
   - block-id pattern (`^id`)
   - wiki-link syntax
   - heading/callout scaffolding
4. Validate by running targeted tests, then full test suite.

## Commit Units
1. `docs(plan): add DEBT-026 fixture sanitization plan`
2. `chore(fixtures): add deterministic lorem sanitizer script`
3. `test(fixtures): sanitize fixture payloads and update affected assertions`
4. `docs(workflow): add DEBT-028 session/divergence checks`

## Verification Gates
- Gate A (after unit 2):
  - Script runs without errors.
  - Dry-run or report lists transformed files.
- Gate B (after unit 3):
  - Targeted suites touching fixture text are green.
  - `npm test` green (or documented failures with root cause).

## Review Hold Requirement
Before commit unit 3 (`test(fixtures): ...`), pause for explicit human review/approval of:
1. changed fixture files,
2. changed snapshots/assertions,
3. residual risk summary.

## Drift Policy
Pause and re-approve if:
- additional fixture classes beyond scoped targets must be rewritten,
- parser invariants break requiring model-level logic changes,
- any sensitive real-text residue remains after sanitizer pass.

## Rollback Plan
- Revert fixture changes while retaining sanitizer script, then iterate sanitization rules.
- If needed, restrict initial pass to highest-risk files and expand in follow-up commits.
