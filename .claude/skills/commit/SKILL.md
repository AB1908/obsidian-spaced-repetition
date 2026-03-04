---
name: commit
description: Draft, validate, and execute a git commit using the project's approval workflow. Use when the user wants to commit staged or specific changes.
---

# Commit Skill

## RULES — check every draft against these before proposing anything

1. **No short codes in subject.** Pattern `[A-Z]+-[0-9]+` is banned from the subject line.
   - BAD: `story: advance META-029 to Ready`
   - GOOD: `story: add commit skill for convention enforcement`
   - BAD: `fix(BUG-042): annotation order`
   - GOOD: `fix(nav): annotation order in section view`
   - Short codes belong in docs or the commit body as `Closes: META-029`, never the subject.

2. **Subject ≤ 72 chars.** Count before proposing.

3. **Subject must start with a valid type:**
   `feat` | `fix` | `refactor` | `perf` | `chore` | `docs` | `test` | `style` | `plan` | `story` | `wf`

4. **1-2 lines max.** Details go in documentation, not commit messages.

5. **Type semantics:**
   - `feat/fix/refactor` — code changes (appear in CHANGELOG)
   - `chore/docs/test/style/perf` — infra (hidden from CHANGELOG)
   - `plan:` — scope files, test contracts, ADRs
   - `story:` — story lifecycle (create, update, close, archive)
   - `wf:` — workflow tooling (hooks, scripts, skills)

## Workflow

### Step 1 — Understand what's staged

```bash
git diff --cached --name-only
git diff --cached --stat
```

If nothing is staged, check `git status` and ask the user what to stage.

### Step 2 — Read the diff for context

```bash
git diff --cached
```

For large diffs, read `git diff --cached --stat` and sample key files.

### Step 3 — Draft the subject

Write the subject. Then before writing anything else, verify against the rules above:
- Does it contain `[A-Z]+-[0-9]+`? If yes, rewrite.
- Is it ≤ 72 chars? If no, shorten.
- Does it start with a valid type? If no, fix.

Only proceed once the draft passes all three checks.

### Step 4 — Write the approval file

```bash
printf 'APPROVED: %s\n\nMESSAGE:\n%s\n\nFILES:\n%s\n' \
  "$(date -Iseconds)" \
  "<subject line here>" \
  "$(git diff --cached --name-only | sed 's/^/- /')" \
  > .commit-approval
```

### Step 5 — Present to user

Show exactly:
```
Ready to commit:

  <subject line>

Files:
  - path/to/file1
  - path/to/file2

Approve?
```

Wait for user confirmation. If they request changes, update both the draft and `.commit-approval`.

### Step 6 — Execute

Only after explicit approval:

```bash
git commit -m "<subject line>"
```

The pre-commit hook will validate `.commit-approval` and auto-delete it on success.

## Edge cases

- **Nothing staged:** Run `git status`, identify what the user likely wants staged, ask before staging.
- **Approval file stale (>5 min):** Recreate it with a fresh timestamp before committing.
- **Hook rejects with stale COMMIT_EDITMSG error:** Delete `.git/COMMIT_EDITMSG` before retrying.
- **Multiple logical changes staged:** Propose splitting into separate commits. Each commit = one logical change.
