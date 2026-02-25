# Prompt: Meta Improvements — Deferred Ideas (2026-02-25)

## Purpose

This file captures meta-workflow improvement ideas that surfaced during plugin
development work but were deferred to avoid slowing down the 0.6.0 release.
Use this as input for a dedicated story-creation or workflow-improvement session.

## Context

These ideas emerged during a planning session for DEBT-007 (flashcard persistence
refactor). The session exposed several planning correctness failures:

- The DEBT-007 plan incorrectly referenced STORY-010 (fingerprinting) as future
  work — it was already Done/archived.
- The DEBT-007 plan incorrectly referenced DEBT-003 (API ergonomics, Done/archived)
  as tracking a different concern.
- The dirty-docs check in `delegate-codex-task.sh` blocked delegation of STORY-027
  because unrelated DEBT-007 draft plan files were uncommitted (fixed in META-005).

Reference commits and docs for context:
- `e644445` — `feat(annotation-list): show category icons in processed rows`
  (first use of `Closes: STORY-NNN` convention in commit body)
- `docs/plans/DEBT-007-flashcard-persistence-pattern.md` — corrected plan
- `docs/stories/META-005-delegation-dirty-docs-and-branch-strategy.md`
- `docs/stories/META-006-planning-traceability-and-doc-hygiene.md`

---

## Deferred Ideas

### 1. Plan folders with code snippet files

Instead of inline code blocks in plan markdown:
```
docs/plans/STORY-NNN/
  plan.md          (prose only)
  snippets/
    before.ts      (current code, copy-pasted)
    after.ts       (proposed implementation)
```

**Motivation**: Inline code in plans is token-heavy for AI sessions; side-by-side
review in an editor is awkward when code is buried in markdown; snippets go stale
and there's no freshness check.

**Tradeoffs**:
- Pro: syntax-highlighted side-by-side review; smaller plan.md; less AI context usage
- Con: delegate script `--scope-file` assumes single file; snippets drift from reality
- Con: more filesystem overhead per story

**Suggested scope**: Adopt as convention for complex plans (>50 lines of code);
keep single-file for simple plans.

---

### 2. Test vault + Obsidian API fixture rerecording (captureProxy)

**Motivation**: `disk.test.ts` contains 260+ lines of inline `sampleMetadataCache`
and `sampleAnnotationMetadata` objects representing Obsidian's `CachedMetadata`
structure. These are:
- Hard to update when Obsidian API changes between versions
- Not representative of a real vault (synthetic, hand-crafted)
- Tested against mocked facade, not real Obsidian behavior

**Idea**: A test vault inside the repo (small set of markdown files) + a captureProxy
mechanism that records real Obsidian API responses (metadata cache, file reads) during
a live Obsidian session and writes them as JSON fixtures. On Obsidian version upgrade,
re-run the proxy to rerecord — any behavioral changes surface immediately.

**Tradeoffs**:
- Pro: fixtures are real, not synthetic; catches API breakage on version upgrades
- Pro: test vault is reviewable and versionable
- Con: requires a running Obsidian instance to rerecord; complex setup
- Con: production-grade practice; significant investment for a personal project

**Related**: DEBT-029 (plan test methodology), DEBT-018 (test vault)

---

### 3. disk.ts `import type` for Obsidian types

`src/infrastructure/disk.ts` imports:
```typescript
import { TagCache, TFile } from "obsidian";
```
Both `TagCache` and `TFile` are used only as type annotations — never as runtime values.
Should be:
```typescript
import type { TagCache, TFile } from "obsidian";
```

**Why it matters**: `import type` is erased at compile time (no runtime side effect);
signals intent; consistent with TypeScript best practices; avoids accidental runtime
dependency on Obsidian in utility code.

**Scope**: 1-line change in `src/infrastructure/disk.ts`. Could be folded into
DEBT-006 or a micro-commit alongside DEBT-007 implementation.

---

### 4. Error handling chain story (DEBT-040)

Already captured as `docs/stories/DEBT-040-flashcard-write-failure-error-handling.md`.
Included here for completeness — needs a plan written before delegation.

Key decisions to make in the plan:
- Throw vs boolean return from `parsedCardStorage` helpers
- Whether to use a typed `Result<T, E>` pattern
- How to surface failure to user (Obsidian `new Notice(...)`)
- In-memory rollback on write failure

---

### 5. Broader test infrastructure audit

Surfaced from reviewing `disk.test.ts`:
- Large inline fixture data (260+ lines) is hard to maintain and visually noisy
- No test for the façade functions themselves against real Obsidian behavior
- `disk.test.ts` tests tag-matching logic but misses write-path coverage (updateCardOnDisk, deleteCardOnDisk)

**Suggested approach for a session**:
1. Extract inline data to JSON fixtures in `tests/fixtures/disk/`
2. Identify what write-path behavior is untested
3. Decide whether to expand disk.test.ts or rely on integration tests in api.test.ts

---

## Suggested session agenda

1. Create story items for ideas 1, 2, 3, 5 above (idea 4 already exists as DEBT-040)
2. Evaluate plan folder convention — write a short ADR if adopted
3. Spike captureProxy feasibility (SPIKE item, time-boxed)
4. Fold `import type` fix into next DEBT-006 or DEBT-007 implementation

## Notes

- Stay laser-focused on 0.6.0 release: BUG-005, BUG-002, BUG-012 (verified done),
  DEBT-007 are the remaining scoped items.
- These meta improvements are quality-of-life; don't let them block shipping.
