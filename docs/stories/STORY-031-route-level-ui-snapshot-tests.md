# STORY-031: Route-Level UI Snapshot Tests as Living Wireframes

## Status
Proposed

## Epic
None

## Description

The plugin has no route-level UI tests. Individual components are tested but no
test verifies what a full screen looks like end-to-end. This creates two gaps:

1. **Regression blind spot** — large structural changes to a route go undetected
   until manual testing. Snapshot tests would catch unexpected layout changes
   automatically.

2. **No shareable wireframes** — when writing user stories or discussing UI
   behavior, there is no artifact to point to. Design intent lives only in prose.
   Snapshot files checked into the repo serve as a living, version-controlled
   "Figma replacement": each story can reference a snapshot path instead of an
   external mockup.

### Proposed Approach

Render each main route using React Testing Library with mock data (the existing
`db.json` / mock-server dataset). Serialize the rendered output to a snapshot
file. These snapshots:

- Live in `tests/snapshots/routes/` (human-browsable)
- Are updated intentionally with `npm test -- -u` when UI structure changes
- Are committed alongside the story or feature that changes them
- Serve as the "before" wireframe when writing new user stories

### Routes to cover (initial set)

| Route | Mock data source |
|---|---|
| Book list (`/books`) | `db.json` books array |
| Book detail (`/books/:id`) | first mock book |
| Annotation detail (`/books/:id/annotations/:id`) | first mock annotation |
| Card review (`/books/:id/review`) | mock review queue |

### Snapshot format

Text serialization via `@testing-library/react`'s `render` + jest snapshot.
Not pixel screenshots — structural HTML snapshots that show component hierarchy
and visible text. These are readable as wireframes in a text editor and diff
cleanly in git.

Example snapshot fragment:
```
<div class="book-list">
  <h1>Your Books</h1>
  <div class="book-card">
    <span class="book-title">Thinking, Fast and Slow</span>
    <span class="coverage">42% covered</span>
    ...
  </div>
</div>
```

### Mock setup pattern

Re-use the existing `USE_JSON_MOCK` pattern. Tests import route components
directly, wrap with a `MemoryRouter`, and provide mock loaders returning
`db.json` fixtures. No running server needed.

### Value for user story writing

When writing STORY-031+, the description can reference:
```
See: tests/snapshots/routes/book-list.snap for current state
```
This replaces "as shown in [Figma link that may be stale]" with a versioned
artifact that is always in sync with the actual component tree.

## Acceptance Criteria

- [ ] Snapshot tests exist for the 4 routes listed above
- [ ] Snapshots live in `tests/snapshots/routes/` and are committed
- [ ] Tests use mock data from `db.json` (no live Obsidian vault needed)
- [ ] `npm test` passes with snapshots present
- [ ] CLAUDE.md or testing guide updated to document the wireframe convention
- [ ] At least one existing user story (`STORY-030` or similar) updated to
      reference its relevant snapshot path

## Likely Touchpoints

- `tests/routes/` — new snapshot test files
- `tests/snapshots/routes/` — snapshot output directory
- `src/ui/routes/` — components under test
- `db.json` — mock data source
- `docs/guides/testing.md` — document snapshot-as-wireframe convention

## Related

- [STORY-018](STORY-018-test-vault-fixture-consistency.md) — related test infra theme
- [META-008](META-008-testing-approach-evaluation.md) — testing approach evaluation
- [META-009](META-009-capture-fixture-cycle.md) — fixture capture patterns
