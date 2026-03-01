# META-023: Story Dedup Skill — Detect Duplicate Stories Before Creation

## Status
Proposed

## Epic
None

## Description

Stories are occasionally created that partially or fully duplicate existing ones. This
happens because story creation is done in context (the author knows what they're adding)
but the catalog grows and prior art gets forgotten. The current `story-catalog.sh suggest`
command helps but requires manual invocation — it's easy to skip.

A skill that runs dedup checks automatically before story creation would catch overlaps
at the point of intent, not after the fact.

### Proposed Skill Behavior

Before creating any new story, the skill:

1. Extracts 2–3 keyword phrases from the proposed story description
2. Runs `scripts/story-catalog.sh suggest <keywords>` for each phrase
3. Shows any matches with their status and a one-line description
4. Asks: "Are any of these the same story?" before proceeding

If no matches: proceeds directly to ID assignment and file creation.
If matches found: surfaces them and lets the user confirm they're distinct.

### Implementation

A `.claude/skills/story-dedup/` skill that wraps the managing-stories skill with a
pre-creation check step. Can call `story-catalog.sh suggest` directly — no new tooling
needed.

Alternatively, fold into the managing-stories skill itself as a mandatory first step.

## Acceptance Criteria

- [ ] Skill runs `story-catalog.sh suggest` on key terms before creating a story
- [ ] Matches are shown with status + one-line description
- [ ] User is prompted to confirm no overlap before proceeding
- [ ] Zero-match case proceeds without extra friction

## Likely Touchpoints

- `.claude/skills/managing-stories/` — either extend or wrap
- `scripts/story-catalog.sh` — `suggest` command (already exists)

## Related

- [META-019](META-019-story-drift-and-agentic-refresh.md) — related catalog hygiene theme
