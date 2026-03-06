# Test Contract: DEBT-047 — Remove Yarn Drift

## Verification commands

TEST_CMD: npm run lint
TEST_CMD: npm test
TEST_CMD: npm run build
TEST_CMD: bash -c '! grep -rn "\"yarn" package.json'
TEST_CMD: bash -c '! test -f yarn.lock'
