# EXEC-2026-02-19-MAIN-origin-main-diff-curation

## Status
Proposed

## Scope
- work key: MAIN
- branch: `main`
- base: `origin/main`
- range: `origin/main..main` (32 commits)

## Planned Commit Topology
1. `chore(workflow): consolidate local execution automation`
2. `test(fixtures): add sanitized fixture capture baseline`
3. `refactor(filter/source): unify source policy and navigation behavior`
4. `fix(bug-008): restore MoonReader naming and plugin reload notice`
5. `docs(backlog): batch-add stories/plans from session review`
6. `refactor(sections): modularize types, guards, heading graph, and parser`
7. `refactor(api): extract application modules and keep api facade thin`
8. `refactor(domain): split annotations-note concerns and introduce flashcard source strategy`
9. `docs(workflow): add history-curation gate and execution-log policy`

## Actual Commit Topology
32 commits in `origin/main..main` as of 2026-02-19.

Highlights:
1. workflow/capture automation (`b9a952b`, `94723da`, `12ff617`, `7a71392`)
2. fixture/test contract commits (`f204fae`, `179e10a`, `8fb9c97`)
3. source/filter behavior changes (`b7ea00b`, `95d8fbd`, `1b6672f`, `6390292`, `f610ffb`)
4. DEBT-031 major refactor chain (curated to 4 commits already)
5. multiple story/plan/docs-only commits that can be squashed

## Final Curated Topology
Pending approval.

Proposed curation method:
1. create `curated/main-history-2026-02-19` from `origin/main`
2. grouped non-interactive `cherry-pick -n` batches + commits
3. validate (`npm test`)
4. move `main` to curated branch after approval

## Drift Notes
| Drift Type | Reason | Decision |
| --- | --- | --- |
| docs scatter | planning and session logging happened incrementally | collapse to logical docs batches |
| fine-grained refactor chain | deterministic, low-risk execution slices | retain as curated 3 refactor + 1 docs commits |

## Validation
- to run after curation: `npm test`

History Curation Approved: no
