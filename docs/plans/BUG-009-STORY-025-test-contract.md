# Test Contract: BUG-009 + STORY-025

**Stories:** BUG-009, STORY-025
**Plan:** [BUG-009-STORY-025-session-plan.md](BUG-009-STORY-025-session-plan.md)
**Mode:** Green commits (pre-commit test gates enforced)

## Required Test Files
TEST_FILE: tests/routes/import/PersonalNotePage.test.tsx
TEST_FILE: tests/config/annotation-categories.test.ts
TEST_FILE: tests/ui/modals/CategoryEditorModal.test.ts

## Required Test Names
TEST_NAME: resets personalNote when navigating to a new annotation
TEST_NAME: resets selectedCategory when navigating to a new annotation
TEST_NAME: addCategoryToList returns error when name already exists
TEST_NAME: addCategoryToList appends new category to list
TEST_NAME: removeCategoryFromList removes category by name
TEST_NAME: reorderCategoryInList moves category up
TEST_NAME: reorderCategoryInList moves category down
TEST_NAME: editCategoryInList updates category name and icon
TEST_NAME: CategoryEditorModal addCategory persists to plugin settings
TEST_NAME: CategoryEditorModal deleteCategory persists to plugin settings
TEST_NAME: manage categories button opens CategoryEditorModal
TEST_NAME: category buttons have aria-label with category name

## Required Verification Commands
TEST_CMD: npm test -- --runInBand tests/routes/import/PersonalNotePage.test.tsx
TEST_CMD: npm test -- --runInBand tests/config/annotation-categories.test.ts
TEST_CMD: npm test -- --runInBand tests/ui/modals/CategoryEditorModal.test.ts
TEST_CMD: npm test -- --runInBand
TEST_CMD: OBSIDIAN_PLUGIN_DIR=. npm run build

## Notes
- Mock `Modal` base class from obsidian — it is already mocked in the jest setup
- Do not test `onOpen()` DOM rendering — test modal method logic only
- Mock `plugin.savePluginData` as `jest.fn().mockResolvedValue(undefined)`
- `annotation-categories.test.ts` requires no Obsidian mock — pure functions only
