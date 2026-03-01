# Test Contract: DEBT-014 — Rename NotesWithoutBooks to SourceListingEntry

## Contract tests

TEST_FILE: tests/api.test.ts

TEST_NAME: getSourcesAvailableForDeckCreation

## Verification commands

TEST_CMD: npm test -- --testPathPattern="api|book"
TEST_CMD: npm run build
TEST_CMD: bash -c '! grep -rn "NotesWithoutBooks" src/ tests/'
