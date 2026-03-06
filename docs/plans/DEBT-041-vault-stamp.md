# Plan: DEBT-041 — Vault Session Stamp (Option B)

## What we're doing

Adding a capture session stamp mechanism so the pre-commit hook can detect when ALL fixture
types (not just `getFileContents`) may be stale after a vault edit.

Option A (warning text only) was rejected — unnecessary if Option B follows immediately.

## Sequencing

Must come after STORY-032 is committed. The stamp hashes all vault files; it must cover
the final vault state including STORY-032's new scenario files.

## Changes

### `scripts/gen-vault-fixtures.mjs`
- Add `import crypto from 'crypto'`
- Add `stamp()` — hashes all vault `.md` files, writes `tests/vault/.capture-session`
- Add `checkStamp()` — compares current vault hashes to `.capture-session`; exits 1 on mismatch; warns (no exit) if no session file yet
- Wire `--stamp` and `--check-stamp` into the args dispatch
- Update usage message

### `package.json`
- Add `"vault:stamp": "node scripts/gen-vault-fixtures.mjs --stamp"`

### `.husky/pre-commit` — extend Check 5
- Exclude `.capture-session` from the `STAGED_VAULT` detection pattern
- After existing `vault:check` passes, run `--check-stamp`
- Hard block (same strictness as `vault:check`) if stamp is stale

### `tests/vault/.capture-session` (new file)
- Created by first `npm run vault:stamp` run after STORY-032 is committed
- JSON: `{ stampedAt, vaultFiles: { "<path>": "<16-char sha256>" } }`
- Committed alongside the DEBT-041 script/hook changes

## Stamp behavior

- No `.capture-session` → warn only (first-time setup, don't block)
- `.capture-session` exists but vault file changed → exit 1
- New vault file not in `.capture-session` → exit 1
- All hashes match → pass

## Verification

```bash
npm run vault:stamp                                          # creates .capture-session
node scripts/gen-vault-fixtures.mjs --check-stamp           # must pass
# modify a vault file without re-stamping, then try to commit → must block
npm run vault:check                                         # must still pass
npm test                                                    # must pass
```
