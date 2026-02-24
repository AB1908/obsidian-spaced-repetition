# Test Contract: DEBT-007 — FlashcardNote Persistence Pattern Refactor

## Contract tests

TEST_FILE: tests/api.test.ts

TEST_NAME: should delete flashcard
TEST_NAME: should throw when deleting non-existent flashcard
TEST_NAME: should update flashcard scheduling metadata
TEST_NAME: should update flashcard contents by id

TEST_FILE: tests/flashcard.test.ts

TEST_NAME: FlashcardNote

## Verification commands

TEST_CMD: npm test -- --testPathPattern="flashcard|api"
TEST_CMD: npm run build
