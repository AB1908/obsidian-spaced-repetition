# STORY-020: Auto-Save UX for Annotation Editor

## Status
Ready

## Epic
[STORY-010](../archive/stories/STORY-010-markdown-engagement.md)

## Depends on
- [STORY-016](STORY-016-customizable-annotation-categories.md) (category data model must be finalized)
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) (state reset must work)

## User Story
As a user editing annotations, I want my changes to save automatically so I don't need to think about when to click Save and can focus on processing annotations.

## Problem
The PersonalNotePage has a Save button that saves both textarea content and category selection. This creates confusion: category clicks feel immediate (visual toggle) but are actually local state until Save is clicked. Meanwhile, navigating to the next annotation auto-saves silently (via `handleNavigate → save()`), making the Save button behavior inconsistent. Obsidian Mobile has precedent for auto-save without dedicated buttons.

## Design

### Behavior
- **Category click**: saves immediately (toggle + persist in one action)
- **Text change**: debounced save (500ms after last keystroke)
- **Navigation**: flushes any pending debounce, saves, then navigates
- **Save indicator**: subtle "Saved" text or checkmark that appears briefly after each persist
- **No Save button**: removed entirely
- **Back button**: remains (navigates back, no save needed since already auto-saved)

### Implementation Notes
- Auto-save reuses existing `save()` from `useAnnotationEditor`
- Debounce via `useRef` timer (avoids `useEffect` cleanup race conditions)
- Navigation flush: `handleNavigate` clears debounce timer and calls `save()` before navigating
- Save indicator: `lastSaved` timestamp state, renders "Saved" for 2s after each persist

## Acceptance Criteria
- [ ] Save button removed from PersonalNotePage
- [ ] Category click triggers immediate save
- [ ] Text changes trigger debounced save (500ms)
- [ ] Navigation flushes pending save before moving
- [ ] Visual save indicator appears after each persist
- [ ] No data loss on rapid navigation
- [ ] Back button still works (no save needed — already persisted)

## Likely Touchpoints
- `src/ui/routes/import/useAnnotationEditor.ts` — add debounced save, remove `handleSave`, add save indicator state
- `src/ui/routes/import/personal-note.tsx` — remove Save button, add save indicator, wire category click to immediate save
- `tests/routes/import/PersonalNotePage.test.tsx` — update for auto-save behavior

## Related
- [STORY-016](STORY-016-customizable-annotation-categories.md) — prerequisite (category model)
- [BUG-009](BUG-009-import-annotation-editor-state-leak.md) — prerequisite (state reset)
