---
name: managing-stories
description: Creates and validates story files (STORY, BUG, DEBT, SPIKE). Enforces correct ID numbering, filename format, and title conventions via story-catalog.sh. Use when creating new stories, scoping work items, adding bugs, recording technical debt, or when the user says "create story", "new bug", "add debt item", or "scope into stories".
---

# Managing Stories

## Before creating any story file

1. Get the next available ID:
   ```bash
   scripts/story-catalog.sh next-id <PREFIX>
   ```
   Where PREFIX is one of: STORY, BUG, DEBT, SPIKE.

2. Use the returned number for the new file and title.

## Story file conventions

**Filename:** `docs/stories/<PREFIX>-<NNN>-<kebab-case-description>.md`

**Title line must match:** `# <PREFIX>-<NNN>: Human Readable Title`

**Required sections:**
```markdown
# PREFIX-NNN: Title

## Status
<Proposed | Ready | In Progress | Done | Backlog>

## Epic
<link or None>

## Description
<problem and context>

## Acceptance Criteria
- [ ] criterion

## Likely Touchpoints
- `src/path/to/file.ts`

## Related
- [OTHER-NNN](OTHER-NNN-name.md)
```

Optional sections: `## Depends on`, `## Notes`, `## Design`, `## Sessions`, `## Plans`.

## After creating or modifying stories

Run the catalog check to validate all stories:
```bash
scripts/story-catalog.sh check
```

Fix any errors before committing.

## Useful commands

- **List all stories:** `scripts/story-catalog.sh list`
- **Search stories:** `scripts/story-catalog.sh suggest <query>`
- **Check validity:** `scripts/story-catalog.sh check`
