# Plan: DEBT-043 — Combined Check Command

## Current State

- No `check` or `typecheck` script in `package.json`
- `tsc --noEmit` never invoked from npm
- `pr.yml` triggers on `branches: [master]` (stale — should be `main`)
- `pr.yml` uses non-existent `actions/checkout@v6` and `actions/setup-node@v6` (latest is v4)
- Job named `build` but does nothing related to building

## Implementation

### 1. package.json — add typecheck + check scripts

```json
"typecheck": "tsc --noEmit",
"check": "npm run lint && npm run typecheck && npm test"
```

### 2. .github/workflows/pr.yml — fix and expand

```yaml
name: Check

on:
    pull_request:
        branches: [main]

env:
    CI_NODE_VERSION: 20

jobs:
    check:
        runs-on: ubuntu-latest
        steps:
            - uses: actions/checkout@v4

            - name: Setup Node
              uses: actions/setup-node@v4
              with:
                  node-version: ${{ env.CI_NODE_VERSION }}
                  cache: npm
                  cache-dependency-path: package-lock.json

            - name: Install Dependencies
              run: npm ci

            - name: Lint
              run: npm run lint

            - name: Typecheck
              run: npm run typecheck

            - name: Test
              run: npm test
```

Use separate steps (not single `npm run check`) so CI output shows which gate failed.

### 3. CLAUDE.md — document check command

Replace the Code Quality section:
```bash
# Code Quality
npm run format       # Format with Prettier
npm run lint         # Check formatting only
npm run typecheck    # Type-check without emitting (tsc --noEmit)
npm run check        # Full gate: lint + typecheck + tests (run before committing)
```

## Note on DEBT-041/042 overlap

DEBT-043 subsumes DEBT-042 (both touch pr.yml). Implement together in one session.
The `branches: [master]` bug and action version fixes should be part of this commit.

## Commit Structure

1. `chore: add typecheck and check scripts to package.json`
2. `chore: fix pr.yml branch, action versions, add typecheck and test steps`
3. `docs: document check command in CLAUDE.md`
