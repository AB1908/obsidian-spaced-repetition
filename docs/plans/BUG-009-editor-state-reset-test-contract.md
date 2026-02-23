# Test Contract: BUG-009 Editor State Reset

**Story:** BUG-009
**Plan:** [BUG-009-editor-state-reset.md](BUG-009-editor-state-reset.md)

## Required Test Files
TEST_FILE: tests/routes/import/PersonalNotePage.test.tsx

## Required Test Names
TEST_NAME: resets personalNote when navigating to a new annotation
TEST_NAME: resets selectedCategory when navigating to a new annotation
TEST_NAME: saves current annotation before navigating to next

## Required Verification Commands
TEST_CMD: npm test -- --runInBand tests/routes/import/PersonalNotePage.test.tsx
TEST_CMD: npm test -- --runInBand
TEST_CMD: OBSIDIAN_PLUGIN_DIR=. npm run build

## Notes
- Do not use useEffect for state reset — use key prop on AnnotationEditorCard
- The Annotation interface must be exported from useAnnotationEditor.ts
- CategoryFilter must be used inside AnnotationEditorCard (not custom icon buttons)
