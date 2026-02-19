# EXEC-2026-02-19-MAIN-curation-audit

## Status
Accepted

## Scope
- pre-curation snapshot: `backup/main-before-curation-2026-02-19` (`9d1539f`)
- post-curation `main`: `8e6f2c4`
- base for both comparisons: `origin/main`

## Summary
- before: 34 commits over `origin/main`
- after: 9 commits over `origin/main`
- intent: collapse noisy commit stream into logical history without dropping functional changes

## Curated History (Final)
1. `25aa779` `chore(workflow): consolidate local execution automation`
2. `a1de284` `test(fixtures): add sanitized fixture capture baseline`
3. `3631c65` `refactor(filter/source): unify source policy and navigation behavior`
4. `55c619d` `fix(bug-008): restore MoonReader naming and plugin reload notice`
5. `7b82b57` `docs(backlog): batch-add stories, plans, and architecture notes`
6. `ca8e943` `refactor(sections): modularize types, guards, heading graph, and parser`
7. `d83deb0` `refactor(api): extract application modules and keep api facade thin`
8. `acab163` `refactor(domain): split annotations-note concerns and introduce flashcard source strategy`
9. `8e6f2c4` `docs(workflow): add history-curation gate and execution-log policy`

## Preserved As Patch-Equivalent
These commits were retained semantically and are equivalent under `git log --cherry-pick`:
1. `af59e8c` -> `ca8e943` (sections refactor)
2. `66ba688` -> `d83deb0` (api refactor)
3. `e334918` -> `acab163` (domain refactor)

## Condensed/Absorbed Commit Groups
1. Into `25aa779`:
   - `7a71392`, `b9a952b`, `94723da`, `12ff617`
2. Into `a1de284`:
   - `f204fae`, `179e10a`
3. Into `3631c65`:
   - `6390292`, `f610ffb`, `1b6672f`, `95d8fbd`, `b7ea00b`
4. Into `55c619d`:
   - `be8a589`, `436f9f6`
5. Into `7b82b57`:
   - `c649498`, `99ec018`, `52f3f19`, `8fb9c97`, `d3dd0c1`, `0c95c5e`, `bbbb654`, `5141e56`, `2eebd62`, `82a3238`, `ee84739`, `9188acf`, `b7d59c4`, `ab01736`, `e49c484`
6. Into `8e6f2c4`:
   - `ac99932`, `dd89f79`, `9d1539f`

## Residual Diff Audit (Pre vs Post)
Comparison: `backup/main-before-curation-2026-02-19..main`

Initial curation left two whitespace-only deltas:
1. `docs/guides/work-organization.md` (one blank line removed)
2. `docs/stories/DEBT-025-periodic-session-capture-hooks.md` (one blank line removed)

Post-review follow-up restored both blank lines.

Result after follow-up:
- no functional/source-code deltas
- no non-audit content dropped

## Validation
1. `npm test` on curated branch before repoint: pass
2. `npm test` on `main` after repoint: pass (38 suites)
3. `git log --left-right --cherry-pick backup...main` used to verify preserved vs condensed commits

## Reviewer Notes
If needed, restore exact pre-curation history with:
- `git checkout main`
- `git reset --hard backup/main-before-curation-2026-02-19`
