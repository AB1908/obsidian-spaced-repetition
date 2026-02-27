# DEBT-042: Wire Up Changelog Generation via standard-version

## Status
Done

## Epic
None

## Description

`standard-version` is already installed but not invoked during release prep.
`prepare-release.sh` only bumps `manifest.json` and `versions.json` — it generates no
changelog entries. The `CHANGELOG.md` has a stale hand-written `[Unreleased]` section
from a previous session that no longer reflects reality (references `ModalTitleProvider`
which has since been deleted).

Conventional commits are already enforced by the commit-msg hook, so `standard-version`
would produce accurate, well-structured output from day one.

### What needs to happen

1. Clear the stale `[Unreleased]` section in `CHANGELOG.md`
2. Add a `standard-version --skip.bump --skip.tag --skip.commit` step to
   `scripts/prepare-release.sh` so changelog entries are generated as part of release prep
3. Verify the output looks correct against recent commit history
4. Update `docs/guides/release-playbook.md` to note changelog generation is now included

### Considerations

- `standard-version` uses `conventional-changelog` under the hood and reads from the
  last git tag to HEAD — so it will correctly pick up all commits since `0.6.0`
- The `--skip.bump`, `--skip.tag`, `--skip.commit` flags prevent it from interfering
  with the existing version bump logic in `prepare-release.sh`
- `chore(release):` commits should be excluded from changelog output (standard-version
  does this by default for `chore` type)

## Acceptance Criteria

- [ ] `CHANGELOG.md` stale `[Unreleased]` section removed
- [ ] `npm run release:prepare -- <version>` generates changelog entries automatically
- [ ] Generated entries correctly reflect `feat`, `fix`, `refactor` commits since last tag
- [ ] `docs/guides/release-playbook.md` updated to mention changelog step
- [ ] `npm test` passes, `npm run build` clean

## Likely Touchpoints
- `scripts/prepare-release.sh`
- `CHANGELOG.md`
- `docs/guides/release-playbook.md`

## Related
- [DEBT-041](DEBT-041-npm-migration-standardization.md)
