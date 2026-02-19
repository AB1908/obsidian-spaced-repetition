# Execution Logs

Execution logs capture run-time delivery mechanics that do not belong in stories or plans.

Use this folder for:

1. commit-topology curation (`planned` vs `actual` vs `final`)
2. approval checkpoints for history rewrite/squash
3. merge integration notes (`what was integrated`, `how`, `validation`)

Do not put product requirements here.
Do not replace story acceptance criteria with execution notes.

Naming:

- `EXEC-YYYY-MM-DD-<WORKKEY>-<slug>.md`
- Example: `EXEC-2026-02-19-DEBT-031-history-curation.md`

Minimum required sections when branch commit count over `main` exceeds policy limit:

1. `## Planned Commit Topology`
2. `## Actual Commit Topology`
3. `## Final Curated Topology`
4. `History Curation Approved: yes`
