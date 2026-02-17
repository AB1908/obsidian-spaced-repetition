# SPIKE-003: Prototype Acceleration Parallel Execution Plan

## Status
Ready

## Epic
None

## Depends on
- [DEBT-015](DEBT-015-dependabot-vulnerability-remediation.md) - security and dependency remediation scope
- [STORY-014](STORY-014-pr-gated-release-automation.md) - PR-gated release automation target
- [DEBT-016](DEBT-016-stale-documentation.md) - docs workflow correctness
- [DEBT-017](DEBT-017-session-notes-location.md) - session log hygiene

## User Story
As a maintainer shipping a prototype under tight deadlines, I want a parallelized execution plan for security, dependencies, delivery workflow, and repo hygiene so that we can move faster without losing release safety.

## Scope
Plan execution across these tracks:
1. security posture and vulnerability burn-down
2. dependency and toolchain modernization
3. dev/release workflow hardening and automation
4. branch/tag cleanup (local + remote)
5. small throughput improvements

## Ground Truth (2026-02-17)
- Active stories already cover key work: DEBT-015, STORY-014, DEBT-016, DEBT-017, DEBT-019.
- CI/release workflows still use legacy actions (`actions/checkout@v2`, `actions/setup-node@v1`) and Node 16.
- `manifest.json.version` is `0.5.1`; `package.json.version` is `0.2.0` (drift that can cause operator confusion).
- Local branches include active and stale branches; remote has many legacy branches (`origin/master`, `origin/develop`, multiple historical feature branches).
- Tag set mixes current policy tags (`0.5.1`) with legacy/non-semver variants (`vnull`, `1.9.2a4`, etc.).

## Execution Strategy
Use one critical path plus parallel independent lanes. Keep behavior risk isolated from cleanup risk.

### Critical Path (must finish first)
1. Security/dependency baseline and CI alignment.
2. Release automation hardening and dry-run verification.
3. Default-branch protection and release gate enforcement.

### Parallel Lanes
- Lane A: Security + dependency remediation (DEBT-015)
- Lane B: Release and CI workflow modernization (STORY-014)
- Lane C: Branch and tag hygiene (new operational lane)
- Lane D: Documentation and execution ergonomics (DEBT-016/017/019)

## Wave Plan

### Wave 0: Baseline and Freeze (Day 0)
Goal: lock current state before wide edits.

Tasks:
- Capture Dependabot snapshot in DEBT-015 with date/time and alert ownership.
- Capture branch inventory (local and remote) and classify each branch: active, merged, stale, unknown owner.
- Capture tag inventory and classify: policy-compliant, legacy-but-keep, invalid/cleanup-candidate.
- Define temporary release freeze window (no ad hoc tags during modernization).

Exit criteria:
- [x] Snapshot committed in story docs.
- [x] Cleanup candidates listed with explicit keep/delete decision.

### Wave 0 Snapshot (Executed 2026-02-17)
Repository snapshot:
- HEAD: `2283752` on `main` (local `main` is ahead of `origin/main` by 1 commit).
- Version alignment:
  - `manifest.json.version`: `0.5.1`
  - `package.json.version`: `0.2.0` (operator-facing drift)
  - `versions.json` contains `0.5.1` entry (`true`)
- Workflow/runtime drift:
  - `actions/checkout@v2` present
  - `actions/setup-node@v1` present
  - `github/codeql-action/*@v1` present
  - CI/release Node runtime pinned to 16 (`16` / `16.x`)

Branch inventory and classification:
- Local branches merged into `main` (delete candidates):
  - `feat/annotation-navigation-component`
  - `test/flashcard-creation-navigation-bug`
- Local branches not merged into `main` (review before delete):
  - `codex-webui-workflow-improvement`
  - `docs/engineering-discipline-story-scope`
  - `fix/test-runner-dx`
  - `refactor/moonreader-parser-decoupling`
- Remote branches merged into `origin/main` (strong prune candidates):
  - `origin/backend-rewrite`
  - `origin/card-creation-flow`
  - `origin/cloze-edit-modal`
  - `origin/edit-modal`
  - `origin/feat/annotation-navigation-component`
  - `origin/feat/moonreader-annotation-processor`
  - `origin/feature/apis-for-frontend`
  - `origin/fix-question-edit-writeback`
  - `origin/fix-scroll-when-switching-annotations`
  - `origin/flashcards-from-books`
  - `origin/history`
  - `origin/note-vs-annotation-toggle`
  - `origin/parser-rewrite-for-card-back`
  - `origin/refactor-cloze-parsing`
  - `origin/refactor/extract-generic-tree-from-decktree`
  - `origin/review-flow`
  - `origin/testing`
- Remote branches not merged into `origin/main` (owner verification required):
  - `origin/codex-webui-workflow-improvement`
  - `origin/develop`
  - `origin/feat/markdown-source-strategy`
  - `origin/feature/book-tree-ui`
  - `origin/master`
  - `origin/refactor-test`
  - `origin/rewrite-cloze-parsing`
  - `origin/rewrite-initialization-logic`
  - `origin/test`

Tag inventory and classification:
- Policy-compliant tags (`X.Y.Z` or `X.Y.Z-beta.N`):
  - stable count: `51`
  - beta count: `0`
- Non-compliant/legacy tag count: `14`
  - examples: `vnull`, `1.9.2a4`, `1.10.0-beta`, `1.8`
- Recency signal (`--sort=-creatordate` top tags):
  - `0.5.1`, `0.5.0`, `0.2.0`, `0.1.0`, `vnull`, `1.10.0`, ...

Immediate decisions from Wave 0:
- Keep all existing tags for now; no tag deletion in Wave 0.
- Proceed with branch cleanup first (lower external compatibility risk than tag deletion).
- Require explicit owner sign-off before deleting non-merged remote branches.
- Dependabot snapshot remains pending until GitHub alert API/UI access is available.

### Wave 1: Security and Toolchain Stabilization (Day 1-2)
Goal: remove high-risk security exposure while keeping build/test stable.

Tasks:
- Patch critical/high vulnerabilities first in small batches (DEBT-015).
- Modernize GitHub Actions primitives:
  - upgrade `checkout`, `setup-node`, CodeQL actions to current supported major versions
  - align CI Node version with supported runtime policy
- Add/confirm lockfile discipline and deterministic install path in CI.
- Re-run required tests/build after each batch (`npm test`, `OBSIDIAN_PLUGIN_DIR=. npm run build`).

Exit criteria:
- [ ] No untriaged critical/high alerts.
- [ ] CI passes on PR with updated actions/runtime.

### Wave 2: Release Automation and Guardrails (Day 2-3)
Goal: make releases deterministic and auditable with minimal manual steps.

Tasks:
- Implement merge-triggered release preparation path per STORY-014.
- Enforce invariant: tag == `manifest.json.version` (already canonical in release playbook).
- Add loop-prevention strategy for automation commits/tags.
- Explicit prerelease behavior for `*-beta.*` tags.
- Add emergency manual path checks (documented fallback remains usable).

Exit criteria:
- [ ] Dry run in test branch/repo produces expected assets.
- [ ] Release docs and workflow behavior match exactly.

### Wave 3: Branch and Tag Hygiene (Day 3, runs in parallel after Wave 1 starts)
Goal: reduce operational clutter and accidental release risk.

Tasks:
- Local branch cleanup:
  - delete merged stale local branches
  - keep only active branches tied to open stories/PRs
- Remote branch cleanup:
  - prune merged historical branches
  - keep long-lived branches only by explicit policy (`main`, any intentional integration branch)
- Tag cleanup policy:
  - do not rewrite/delete public tags without explicit decision log
  - separate "legacy archive tags" vs "active release tags"
  - if deletion is approved, execute from documented allowlist only
- Add a lightweight "branch/tag hygiene" checklist to workflow docs (monthly cadence).

Exit criteria:
- [ ] Branch list reduced to active operational set.
- [ ] Tag policy documented; cleanup executed only for approved candidates.

### Wave 4: Throughput Quick Wins (Day 3-4)
Goal: improve execution speed for future waves.

Tasks:
- Complete DEBT-016 and DEBT-017 so documentation and session records are low-friction and current.
- Start DEBT-019 Level 1 or 2 (manual checklist or shell runner for wave execution).
- Add PR template fields required by `github-execution-and-beta-release-workflow.md`.
- Add CODEOWNERS / reviewer routing if team size justifies it.

Exit criteria:
- [ ] Workflow docs no longer contradict active process.
- [ ] Parallel execution overhead reduced for next multi-lane effort.

## Merge-Conflict and Ownership Plan
- Lane A owner files: `package.json`, lockfile, `.github/workflows/*`, vulnerability story docs.
- Lane B owner files: `.github/workflows/release.yml`, `scripts/prepare-release.sh`, release guides.
- Lane C owner scope: git refs and docs notes only; avoid code changes.
- Lane D owner files: `docs/guides/*`, `docs/stories/DEBT-016*`, `docs/stories/DEBT-017*`, optional `scripts/*` for orchestration.

Rule:
- Any workflow file touched by Lane A and Lane B must be sequenced via short-lived integration branch to avoid accidental regressions.

## Suggested Branches
- `chore/security-deps-remediation` (Lane A)
- `feat/pr-gated-release-automation` (Lane B)
- `chore/branch-tag-hygiene-2026-02` (Lane C)
- `chore/workflow-docs-and-wave-runner` (Lane D)

## Active Worktree Delegation (2026-02-17)
- Lane A (`chore/security-deps-remediation`): `.worktrees/lane-a-security`
  - Scope: DEBT-015, CI action/runtime modernization, dependency remediation in small batches.
- Lane B (`feat/pr-gated-release-automation`): `.worktrees/lane-b-release`
  - Scope: STORY-014 release automation, prerelease/stable behavior, loop-prevention.
- Lane C (`chore/branch-tag-hygiene-2026-02`): `.worktrees/lane-c-hygiene`
  - Scope: branch/tag hygiene docs + scripts; destructive cleanup commands only after explicit approval.
- Lane D (`chore/workflow-docs-and-wave-runner`): `.worktrees/lane-d-workflow`
  - Scope: DEBT-016/017 alignment plus DEBT-019 Level 1/2 runner bootstrap.

Execution contract:
- Each lane works only inside its assigned worktree and branch.
- Each lane commits independently; review is branch-by-branch diff.
- Lane A and Lane B sequence overlapping workflow file edits before merge.

## Deferred Deep-Scale Concerns
- Larger governance/process controls are intentionally deferred for now.
- Keep this plan focused on practical prototype velocity and release safety.

## Exit Criteria for This Plan
- [ ] Critical/high vulnerabilities triaged and remediated or explicitly time-boxed.
- [ ] CI/release workflows modernized and green.
- [ ] Release path deterministic, documented, and dry-run validated.
- [ ] Branch/tag surface area reduced with an auditable policy.
- [ ] Docs and execution workflow updated to reduce ongoing coordination cost.

## Session Notes
### 2026-02-17
- Executed Wave 0 local inventory and classification for branches/tags/workflow runtime.
- Identified concrete prune candidates for local and merged remote branches.
- Deferred tag deletion pending explicit policy approval and compatibility review.
- Dependabot snapshot task is blocked on GitHub alert access and remains open under DEBT-015.

### 2026-02-17 (Retrospective: What Went Wrong in Execution)
- We over-optimized orchestration/tooling before finishing core lane deliverables. This introduced script/process churn and increased review surface area.
- User intervention prompts were higher than expected. Key prompts the user had to provide repeatedly:
  - enforce model split (`Codex` for complex, `Gemini` for smaller)
  - ask to actually launch per-worktree agents (not just prepare worktrees)
  - request full-privilege/autonomous execution to avoid approval stalls
  - request direct progress checks and interactive monitoring commands
  - request recovery/resume behavior when sessions died
- Root causes for prompt burden:
  - execution control was not encoded as a hard contract in initial lane prompts
  - agents were launched with mixed interactive/non-interactive modes
  - no deterministic checkpoint/resume mechanism at first
  - no single canonical place for reasoning traces from all lanes
- Why `SPIKE-003` appears in all worktree histories:
  - all lane branches were created from `main` after `SPIKE-003` commits landed; shared ancestor history is expected.
- Why plan-before/after discipline drifted:
  - lane prompts prioritized “keep moving autonomously” but did not enforce “update plan checkpoint before and after each batch” as a required gate.
  - monitor tooling reported state but did not block work when plan check-ins were missing.
- Reasoning-trace placement issue:
  - trace capture scripts were authored/executed in lane C and initially wrote outputs there; naming also defaulted to date-only files, which is ambiguous.
  - fix direction: keep one canonical cross-lane trace index and enforce lane-prefixed filenames.

### 2026-02-17 (Corrective Actions)
- Re-center on incremental delivery: complete lane scope first, tooling second.
- Require per-lane “before/after” note updates in story/session docs for each commit batch.
- Keep one lockfile strategy per lane unless intentionally migrating package manager.
- Use deterministic checkpoint files for restart, but keep naming lane-specific and minimal.
- Run explicit code review gate per lane before merge, then perform manual deep review in each worktree.

## Related
- [DEBT-015](DEBT-015-dependabot-vulnerability-remediation.md)
- [STORY-014](STORY-014-pr-gated-release-automation.md)
- [DEBT-016](DEBT-016-stale-documentation.md)
- [DEBT-017](DEBT-017-session-notes-location.md)
- [DEBT-019](DEBT-019-wave-runner-automation.md)
- Guide: [release-playbook](../guides/release-playbook.md)
- Guide: [github-execution-and-beta-release-workflow](../guides/github-execution-and-beta-release-workflow.md)
