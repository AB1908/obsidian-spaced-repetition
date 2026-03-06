# Scratch — observations and deferred thoughts

Append-only. Review at session start. Promote to story or delete when actioned.

---

2026-03-01: Test contract gotcha — absence checks need negation.
- `grep -rn "foo" src/` exits 0 when it FINDS matches, 1 when it doesn't.
- Contract script treats non-zero exit as failure, so bare grep passes only when the
  symbol still exists — wrong for "confirm it's gone" checks.
- Fix: use `bash -c '! grep -rn "foo" src/'` in TEST_CMD lines.
- Similarly: `npm run lint` exits 1 on pre-existing formatting debt. Scope contract
  checks to verify the CHANGE, not pre-existing repo health.

2026-03-01: DEBT-002, DEBT-006, DEBT-012 need freshness pass before delegation.
- Repo structure has changed significantly since they were written.
- Do NOT delegate without verifying touchpoints still exist.

2026-03-01: Debt staleness command idea.
- `story-catalog.sh staleness` — sort stories by `git log --diff-filter=A` date.
- Useful signal for which stories are most likely stale.
- Action: freshness check at delegation time, not as a batch background job.
- Not yet a story — promote when we start doing freshness checks regularly.

2026-03-01: STORY-031 paused — hard dependency on STORY-018.
- Test vault should be the single fixture source for both frontend + backend tests.
- db.json to be deprecated as part of STORY-018 scope.
- STORY-031 mock data should come from the test vault via mock plugin, not db.json.
- Resume STORY-031 planning after STORY-018 is implemented.

2026-03-03: Playwright-driven Obsidian fixture capture (deferred spike).
- Load tests/vault/ into Obsidian programmatically, navigate plugin UI, capture all fixtures.
- Obsidian = Electron app; Playwright supports Electron via launch({executablePath}).
- Value: fully automated fixture refresh — no manual Obsidian navigation.
- Complexity: plugin loading, vault setup, navigation scripting, cross-platform Electron path.
- Natural fit after Phase B (facade-level mocking) since the capture seam would be explicit.
- Promote to SPIKE when investing in Phase B.

2026-03-03: Dangling link references in story files.
- META-024 had a forward reference to META-025 which was later deleted.
- No tooling catches broken cross-story links — we only find them via git blame.
- Obsidian solves this natively with link graph and dead link detection.
- Worth considering: a story-catalog.sh check for dangling [[links]] or .md refs.
- Not a story yet — promote when we decide on a link convention.

2026-03-05: Dependency graph planning — soft vs hard dependencies not tracked.
- STORY-032 and DEBT-047 are safe to parallelize at the file level, but have a soft
  sequencing risk: if DEBT-047 ships a vault stamp mechanism (Option B), STORY-032 must
  update the stamp or the hook blocks. Neither story captures this dependency.
- Current "Depends on:" field is binary (hard block) — no way to express "prefer after" or
  "coordinate on shared artifact" without a full hard dependency.
- We likely have a story for dependency graph / richer story organization — find and link.
- Until then: document soft deps in a "Coordination" or "Sequencing Notes" section inside
  each story when parallelism risk exists.

2026-03-05: story-catalog.sh UX friction — enhance vs. replace?
- Finding a story by vague description is painful: no sort-by-creation-date, unclear match
  scoring, no filter composition (status AND epic AND keyword), output formatting is dense.
- Root issues: grep-based matching with no ranking, no index, no structured query language.
- Two paths forward:
  1. Enhance script: add `--sort=created` (via git log --diff-filter=A), `--filter` flag
     composition, `--format=compact|full` output modes. Low friction to adopt, stays in-repo.
  2. Dedicated tooling: a small Node/TS CLI that parses story frontmatter into an in-memory
     index and supports rich query + sort. More capable but adds a build step and maintenance.
- Lean toward (1) first: add `--sort=created` and improve match output (show which field
  matched, show status inline). Revisit (2) if query complexity keeps growing.
- Immediate pain point: no way to find "the story I added last week about X" without grep.
- Promote to META story if the script keeps growing beyond ~150 lines of query logic.

2026-03-01: DEBT items deferred to next session.
- DEBT-012 (class misuse + window.confirm) — self-contained, needs freshness check first.
- DEBT-024 (filter policy) — reasonably contained, check DEBT-022 dependency.
- DEBT-040 (error handling) — needs architectural decision before delegation.
