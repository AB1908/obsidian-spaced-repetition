# META-026: Approval Tracking for Stories and Plans

## Status
Done

## Epic
None

## Description

No field exists to distinguish human-reviewed artifacts from Claude-generated ones
that were rubber-stamped at commit time. This matters most for plan files (unreviewed
plans get delegated) but also for stories (unreviewed stories shape wrong work).

### Proposed fields

**Stories** — add `## Reviewed` with values:
- `No` — Claude-authored, not yet read carefully by a human
- `Yes` — human read and approved the scope
- `Delegated` — sent to Codex (implies human reviewed the plan, not necessarily the story)

**Plans** — add `## Reviewed` with values:
- `Draft` — Claude-authored, not yet approved
- `Approved` — human signed off on scope before delegation

### story-catalog.sh support

`story-catalog.sh list --unreviewed` filters to stories where `## Reviewed` is `No`
(or field is absent). Surfaces the review backlog at session start.

## Acceptance Criteria

- [x] `## Reviewed` field added to story template in `.claude/skills/managing-stories/SKILL.md`
- [x] Plan file convention documented in `docs/guides/work-organization.md`
- [x] `story-catalog.sh list --unreviewed` filters unreviewed stories
- [x] `story-catalog.sh` reads `Reviewed` field from story files

## Likely Touchpoints

- `.claude/skills/managing-stories/SKILL.md`
- `scripts/story-catalog.sh`
- `docs/guides/work-organization.md`
