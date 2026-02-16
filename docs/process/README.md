# Process Session Reports (Experimental)

This folder stores local, repo-based process analysis artifacts for the rolling meta PR workflow.

## Goals
- Capture what went right/wrong per story or task without GitHub API dependencies.
- Keep automation local to git state, file scope, and test checklist generation.
- Require only human review for policy decisions.

## Generate a Session Report

```bash
scripts/process/generate-session-report.sh \
  --story DEBT-008 \
  --base origin/main \
  --allowed-file src/api.ts \
  --allowed-file src/ui/components/book-list.tsx \
  --allowed-file tests/api.test.ts \
  --allowed-file tests/api.clippings.test.ts \
  --allowed-file docs/stories/DEBT-008-notes-without-review-naming.md \
  --allowed-file docs/stories/DEBT-014-source-listing-dto-typing.md
```

Output defaults to:
- `docs/process/sessions/YYYY-MM-DD/<STORY_ID>.md`

## Suggested Flow
1. Run generator after a coding session on the story branch.
2. Review/fill the generated sections:
   - What Went Well
   - What Went Wrong
   - Proposed Guardrails
   - Tradeoffs
3. Commit the session report to the rolling process/meta branch.
4. Link it in the meta PR iteration log.

## Notes
- This is intentionally git-only automation (no `gh`, no tokens, no remote API).
- False positives are expected; treat heuristics as signals, not verdicts.
