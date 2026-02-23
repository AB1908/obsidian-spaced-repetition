# Test Contract: STORY-028 — Collapse Add Row in CategoryEditorModal

## Contract tests

TEST_FILE: tests/ui/modals/CategoryEditorModal.test.ts

TEST_NAME: CategoryEditorModal shows trigger button on open, not add form
TEST_NAME: CategoryEditorModal shows add form after trigger click
TEST_NAME: CategoryEditorModal collapses add form on cancel
TEST_NAME: CategoryEditorModal calls onSave with updated list after add

## Verification commands

TEST_CMD: npm test -- --testPathPattern="CategoryEditorModal"
TEST_CMD: npm run build
