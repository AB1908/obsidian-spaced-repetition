# Plan: STORY-020 — Auto-Save UX for Annotation Editor

## Story
[STORY-020](../stories/STORY-020-auto-save-annotation-editor.md)

## Summary
Replace the explicit Save button in `PersonalNotePage` with auto-save:
- Category click → immediate save
- Text change → debounced save (500ms)
- Navigation → flush pending debounce then navigate
- Visual save indicator ("Saved" for ~2s)

## Phases

### Phase 1 — Hook: debounced save + save indicator state
File: `src/ui/routes/import/useAnnotationEditor.ts`

Changes:
- Add `debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)` for the debounce
- Add `lastSaved` state for the save indicator (timestamp or boolean)
- Rename / remove `handleSave` — replaced by `saveImmediate()` internal helper
- Add `handleTextChange(text)`: updates local state + clears old timer + sets new timer calling `save()` after 500ms
- Update `handleNavigate` to: clear timer, call `save()`, then navigate
- Add `handleCategoryChange(category)`: updates state + calls `save()` immediately
- Export `lastSaved` (or derived `showSavedIndicator`)

### Phase 2 — View: remove Save button, add indicator, wire category
File: `src/ui/routes/import/personal-note.tsx`

Changes:
- Remove Save button and its `onClick` handler
- Wire textarea `onChange` → `handleTextChange`
- Wire category clicks → `handleCategoryChange`
- Add save indicator: small "Saved ✓" text, conditionally rendered while `showSavedIndicator` is true

### Phase 3 — Tests
File: `tests/routes/import/PersonalNotePage.test.tsx`

Changes:
- Update/remove tests that expected Save button
- Add: category click triggers save
- Add: text change after debounce triggers save
- Add: navigation flushes save before navigating
- Use `jest.useFakeTimers()` for debounce assertions

## Acceptance Criteria (from story)
- [ ] Save button removed from PersonalNotePage
- [ ] Category click triggers immediate save
- [ ] Text changes trigger debounced save (500ms)
- [ ] Navigation flushes pending save before moving
- [ ] Visual save indicator appears after each persist
- [ ] No data loss on rapid navigation
- [ ] Back button still works

## Touchpoints
- `src/ui/routes/import/useAnnotationEditor.ts`
- `src/ui/routes/import/personal-note.tsx`
- `tests/routes/import/PersonalNotePage.test.tsx`

## Commit Topology
1. `refactor(import): extract save logic into debounced hook`
2. `feat(import): replace Save button with auto-save and indicator`
3. `test(import): update PersonalNotePage tests for auto-save`
