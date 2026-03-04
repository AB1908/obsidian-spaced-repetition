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

2026-03-01: DEBT items deferred to next session.
- DEBT-012 (class misuse + window.confirm) — self-contained, needs freshness check first.
- DEBT-024 (filter policy) — reasonably contained, check DEBT-022 dependency.
- DEBT-040 (error handling) — needs architectural decision before delegation.
