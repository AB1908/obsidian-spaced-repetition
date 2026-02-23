# Test Contract: STORY-025 — CategoryEditorModal

## Contract tests

### Pure function unit tests

TEST_FILE: tests/config/annotation-categories.test.ts

TEST_NAME: addCategoryToList adds a new category to the list
TEST_NAME: addCategoryToList returns error when name already exists
TEST_NAME: addCategoryToList returns error when name is empty
TEST_NAME: removeCategoryFromList removes the named category
TEST_NAME: removeCategoryFromList is a no-op when name not found
TEST_NAME: reorderCategoryInList moves category up
TEST_NAME: reorderCategoryInList moves category down
TEST_NAME: reorderCategoryInList is a no-op at boundary
TEST_NAME: editCategoryInList renames a category
TEST_NAME: editCategoryInList swaps icon
TEST_NAME: editCategoryInList returns error when new name conflicts

### Modal unit tests

TEST_FILE: tests/ui/modals/CategoryEditorModal.test.ts

TEST_NAME: CategoryEditorModal calls onSave with updated list after add
TEST_NAME: CategoryEditorModal calls onSave with updated list after delete
TEST_NAME: CategoryEditorModal calls onSave with reordered list after move
TEST_NAME: CategoryEditorModal calls getOrphanCount before delete confirm
TEST_NAME: CategoryEditorModal does not call onSave when delete is cancelled

### PersonalNotePage integration tests

TEST_FILE: tests/routes/import/PersonalNotePage.test.tsx

TEST_NAME: PersonalNotePage opens CategoryEditorModal when Manage categories button clicked
TEST_NAME: CategoryFilter buttons have aria-label with category name
TEST_NAME: CategoryFilter buttons have title with category name

## Verification commands

TEST_CMD: npm test -- --testPathPattern="annotation-categories|CategoryEditorModal|PersonalNotePage"
TEST_CMD: npm run build
