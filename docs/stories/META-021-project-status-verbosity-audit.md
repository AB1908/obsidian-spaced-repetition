# META-021: project-status.sh Verbosity Audit

## Status
Proposed

## Epic
None

## Description

`project-status.sh` is documented as "the single-read project state summary for session start" and is meant to minimize token usage. However, several sections produce output that an agent cannot act on, duplicates information already in CLAUDE.md, or varies in value depending on the session type (release vs. daily work). This story captures which sections are high-value, which are verbose or redundant, and proposes a `--brief` mode to trim noise at session start.

### Analysis of project-status.sh (140 lines)

The script produces five distinct output sections. They are evaluated below from a session-start agent perspective — i.e., "what does an agent need to orient itself and propose a work order?"

---

#### Section 1 — Version / Git state (lines 35–46)

**Output:**
```
=== Project Status ===
Version: 0.5.2  Branch: main  Ahead: 0 commits
Last commit: 47257c3 docs(debt): add complexity and readability audit story
```

**Value: High — keep, already terse.**

This is the minimum viable orientation header. Branch, ahead-count, and last commit give an agent the context it needs to reason about whether there are unpushed commits or a stale checkout. No changes recommended.

---

#### Section 2 — Story counts (lines 48–64)

**Output:**
```
Stories (42 total)
  ✓ Done: 18
  ▶ In Progress: 2
  ○ Ready: 7
  · Backlog: 11
  ? Proposed: 4
```

**Value: Medium — keep but consider condensing.**

The count table is useful as a quick workload snapshot. However, "Done" count (line 62) is noise at session start — an agent doesn't need to know how many stories are finished. The Backlog count is similarly low-value; backlog items are not actionable without further filtering. Only "In Progress", "Ready", and "Proposed" matter for orienting work.

**Candidate for `--brief` suppression:** "Done" and "Backlog" rows in the count table.

Verbose span: lines 60–63 (`for s in "Done" "In Progress" ...`).

---

#### Section 3 — In Progress list (lines 66–80)

**Output:**
```
In Progress
  ▶ STORY-019-remove-filter-buttons-card-creation
  ▶ DEBT-007-flashcard-persistence-pattern
```

**Value: High — keep, already terse.**

This is the most actionable section. An agent's first move at session start is to check what's already running. The raw filenames are slightly noisy (slug repeated from the key) but functional.

Minor improvement opportunity: strip the numeric key prefix duplication (e.g., show `STORY-019: Remove filter buttons` instead of the full slug) — but this is cosmetic and out of scope for this story.

---

#### Section 4 — Release plan items (lines 82–131)

**Output (with `--release`):**
```
Release: 0.6.0
  ✓ [T1-bug] BUG-008: MoonReader name shows Annotations — Done
  ▶ [T1-bug] BUG-007: Section list flattens headings — In Progress
  ...
```

**Value (with `--release`): High — keep.**
**Value (without `--release`, but plan file exists): Problematic.**

Lines 83–84 show the issue:
```bash
release_plan="${PLANS_DIR}/v0.6.0-release-plan.md"
if [ "$1" = "--release" ] 2>/dev/null || [ -f "$release_plan" ]; then
```

When the release plan file exists on disk, this section renders even without `--release`. This means a standard session-start run (no flags) silently becomes a release-focused read whenever a plan file is present. That conflates "daily work" and "release work" sessions without the user asking for it.

The hardcoded version string `"Release: 0.6.0"` (line 85) is also a maintenance hazard — it will be stale after the release ships unless manually updated.

**Candidates for improvement:**
- Lines 83–84: The `|| [ -f "$release_plan" ]` auto-trigger should be removed or gated behind `--release` only.
- Lines 85, 88–116: The hardcoded arrays (items, labels, tiers) are verbose maintenance surface. They should be driven from the plan file itself rather than duplicated in the script.
- In `--brief` mode: suppress Tier information (labels only, no tier badges) — `[T1-bug]` is noise unless doing release triage.

Verbose span: lines 83–131 (49 lines for a section that is only relevant to release sessions).

---

#### Section 5 — Quick Health / Test suite (lines 133–140)

**Output:**
```
Quick Health
  Test suites: 24
  Build: run npm run build to verify
```

**Value: Low — verbose for session start, borderline noise.**

This section has two problems:

1. `npm test -- --listTests` (line 136) actually **runs** `npm test` initialization — on a cold machine or inside a CI-like environment this can be slow (several seconds). It counts test suite files, not test cases, and the number rarely changes between sessions.

2. The "Build: run npm run build to verify" message (line 139) is a static reminder that an agent cannot act on without being explicitly asked to build. It adds a line of output but conveys no session-specific information.

**Recommendation:** In `--brief` mode, suppress the entire Quick Health section. In default mode, at minimum remove line 139 (the static build reminder) since it is always true and never actionable as orientation.

Verbose span: lines 133–140 (8 lines producing ~2 lines of output with marginal value).

---

### Summary Table

| Section | Lines | Value | `--brief` recommendation |
|---|---|---|---|
| Version / Git state | 35–46 | High | Keep unchanged |
| Story counts | 48–64 | Medium | Suppress Done + Backlog rows |
| In Progress list | 66–80 | High | Keep unchanged |
| Release items | 82–131 | High (with `--release`) / Problematic (auto-trigger) | Remove auto-trigger; hardcoded arrays are verbose |
| Quick Health | 133–140 | Low | Suppress entirely in `--brief` |

---

### Proposed `--brief` Mode

Add a `--brief` flag that produces only the minimum orientation output:

```
=== Project Status (brief) ===
Version: 0.5.2  Branch: main  Ahead: 0 commits
Last commit: 47257c3 docs(debt): add complexity and readability audit story

Stories: 2 In Progress, 7 Ready, 4 Proposed

In Progress
  ▶ STORY-019-remove-filter-buttons-card-creation
  ▶ DEBT-007-flashcard-persistence-pattern
```

This is ~8 lines vs. the current ~25–40 lines (or more with `--release`). For a typical daily session start, this is sufficient for an agent to orient and propose a work order.

**`--brief` suppresses:**
- Done and Backlog rows in story counts
- The entire Quick Health section
- The Release section (unless `--release` is also passed)
- The static build reminder

**`--release` remains additive:** passing both `--brief --release` shows brief header + release items (no tier badges in brief mode).

### Additional Fix (independent of `--brief`)

The auto-trigger of the release section when the plan file exists (line 84: `|| [ -f "$release_plan" ]`) should be removed regardless of the `--brief` flag. This is a correctness issue: the flag semantics should be authoritative.

## Acceptance Criteria

- [ ] `--brief` flag implemented in `project-status.sh`
- [ ] `--brief` output is <= 10 lines for a standard non-release session
- [ ] Release section auto-trigger on plan file existence removed (line 84)
- [ ] Hardcoded version string "Release: 0.6.0" (line 85) replaced with dynamic read from plan file or current version
- [ ] `npm test -- --listTests` removed from default and brief runs (test count adds latency, not orientation value)
- [ ] CLAUDE.md updated to recommend `--brief` for typical session start and `--release` for release sessions

## Likely Touchpoints

- `scripts/project-status.sh` (lines 83–84, 85, 133–140 are the primary targets)
- `CLAUDE.md` (Session Start Workflow section)

## Related

- [META-019](META-019-story-drift-and-agentic-refresh.md) — also proposes additions to `project-status.sh`
- [META-006](META-006-planning-traceability-and-doc-hygiene.md)
