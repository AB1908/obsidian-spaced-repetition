# META-018: Define and Adopt Epic Field Convention

## Status
Proposed

## Epic
None

## Description

Every story template includes `## Epic` but it's universally set to `None`. The field
was added without a defined convention, so it's never been used.

### Proposed Convention

Use Epic as a **release/milestone grouping only** — not feature-theme grouping.

- One epic = one release milestone (e.g. `0.7.0`, `annotation-ux-overhaul`)
- Stories without a release target stay `None`
- Cross-cutting stories pick the milestone they unblock

### Benefits

- `project-status.sh` can show per-epic progress: "5/8 done for 0.7.0"
- Story catalog can answer "what's left for 0.7.0?" in one command
- Reduces need for separate sprint plan files in `docs/plans/releases/`

### Alternatives Considered

- **Feature-theme grouping** (e.g. "Annotation UX", "Domain Model") — too many
  cross-cutting stories; maintenance burden outweighs benefit
- **Remove the field** — loses future value; low cost to keep

## Acceptance Criteria

- [ ] Convention documented in `docs/guides/work-organization.md`
- [ ] `scripts/story-catalog.sh` updated to support `list --epic <name>`
- [ ] Existing Ready/Proposed stories backfilled with epic where appropriate

## Likely Touchpoints
- `docs/guides/work-organization.md`
- `scripts/story-catalog.sh`
- All active story files

## Related
- [META-010](META-010-plan-storage-linking.md)
