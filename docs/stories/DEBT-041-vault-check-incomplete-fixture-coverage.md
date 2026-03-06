# DEBT-041: vault:check Only Verifies getFileContents Fixtures

## Status
In Progress

## Reviewed
No

## Epic
None

## Description
`npm run vault:check` (and the pre-commit hook) only compares vault `.md` file content against `getFileContents_*.json` fixture output. But when a vault file changes, all of the following fixtures become stale:

- `getFileContents_*` — raw content ← currently checked
- `getMetadataForFile_*` — headings, sections, byte offsets tied to exact content
- `getTFileForPath_*` — TFile objects (path, name, stat)
- `fileTags_*` — tags read from frontmatter across the whole vault
- `filePathsWithTag_*` — which files appear for a given tag

The current check gives a false sense of completeness: it passes even when metadata fixtures are stale, which can allow subtle bugs (e.g. wrong byte offsets) to go undetected.

## Acceptance Criteria
- [ ] The hook/check makes clear to the user that ALL fixture types may need re-capturing when vault files change, not just getFileContents
- [ ] Chosen approach implemented (see Design below)
- [ ] `vault:check` documentation updated to reflect actual scope

## Design

Two approaches to consider:

**Option A — Broaden the warning message (low effort)**
Keep the getFileContents content check as a sanity check, but add an explicit warning:
> "Vault files changed. getMetadataForFile, getTFileForPath, fileTags, and filePathsWithTag fixtures may also be stale. Re-capture all fixtures from Obsidian."

**Option B — Vault session stamp (higher confidence)**
Add `tests/vault/.capture-session` — a file containing a hash of all vault file contents at the time of last Obsidian capture. Workflow:
- After a full capture session: run `npm run vault:stamp` to record current vault state
- Pre-commit hook: if vault files staged without `.capture-session` also being updated, block commit
- This makes "I did a full re-capture" an explicit, auditable step

Option A is low-effort and honest about limitations. Option B adds ceremony but enforces the full re-capture discipline.

## Likely Touchpoints
- `scripts/gen-vault-fixtures.mjs` — check and stamp commands
- `.husky/pre-commit` — hook message or stamp check
- `package.json` — `vault:stamp` script if Option B

## Plan
See `docs/plans/DEBT-041-vault-stamp.md`

## Related
- [STORY-018](STORY-018-test-vault-fixture-consistency.md) — vault:check introduced here
- [STORY-032](STORY-032-test-vault-scenario-coverage.md) — scenario coverage (re-capture needed when adding new vault files)
