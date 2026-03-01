# Test Contract: DEBT-008 — Remove getNotesWithoutReview Deprecated Alias

## Contract tests

TEST_FILE: tests/api.test.ts

TEST_NAME: getSourcesAvailableForDeckCreation

## Verification commands

TEST_CMD: npm test -- --testPathPattern="api"
TEST_CMD: npm run build
TEST_CMD: grep -rn "getNotesWithoutReview" src/ tests/
