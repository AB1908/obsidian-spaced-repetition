# Commit Approval Workflow Evolution

## Status
Active development - Testing branch-aware enforcement

## Context

We repeatedly encountered verbose commit messages across sessions, violating the "Commits tell WHAT, docs tell WHY" philosophy. Need deterministic enforcement without breaking feature branch workflow.

## Problem Statement

**Symptom:** Claude writes 10-20 line commit messages with nested bullets, duplicating documentation content.

**Root Cause:**
1. No checkpoint forcing user approval before commit
2. LLM defaults to comprehensive messages (training bias)
3. No automated feedback loop

**Impact:** Git history becomes unreadable, violates documented workflow, requires manual rebasing to fix.

## Solutions Evaluated

### Option 1: Hard Enforcement Everywhere (Initial Implementation)

**Approach:**
- Pre-commit hook blocks ALL commits without `.commit-approval` file
- Commit-msg hook blocks messages >5 lines

**Pros:**
- Completely deterministic
- Impossible to violate (without --no-verify)

**Cons:**
- Too restrictive for feature branches
- Blocks experimentation
- Requires approval for every WIP commit
- Doesn't leverage feature branch → PR → squash merge workflow

**Verdict:** ❌ Too rigid

---

### Option 2: Soft Determinism with LLM Self-Correction (Selected)

**Approach:**
- **Main branch:** Hard enforcement (block without approval)
- **Feature branches:** Soft enforcement (warn but allow)
- **LLM feedback loop:** Warnings visible in tool output → LLM can rewrite or ask user

**Implementation:**
```bash
# Pre-commit hook
BRANCH=$(git branch --show-current)

if [ "$BRANCH" = "main" ]; then
  # HARD: Block without approval
  exit 1
else
  # SOFT: Warn if verbose, but allow
  if [ verbose ]; then
    echo "⚠️  WARNING: Verbose commit on feature branch"
    echo "Consider: <suggest concise version>"
    exit 0  # Allow
  fi
fi
```

**Pros:**
- Main branch stays clean (hard enforcement)
- Feature branches flexible (soft warnings)
- LLM gets feedback and can self-correct
- Compatible with PR squash-merge workflow
- Natural checkpoint: PR review before merge to main

**Cons:**
- Feature branches can still have verbose commits
- Requires discipline to squash before merging

**Mitigation:**
- GitHub PR template reminds to squash
- CI can validate PR commit format
- Final merge to main is where it matters

**Verdict:** ✅ Selected - Best balance

---

### Option 3: GitHub PR Workflow

**Approach:**
- All work in feature branches
- Claude opens draft PR
- User reviews/approves on mobile
- Squash merge to main

**Pros:**
- Mobile-friendly approval
- Visual diff review
- CI/CD validation
- Works when away from dev machine

**Cons:**
- Slower than local workflow
- Requires network
- More ceremony for small changes
- Can't prevent verbose commits initially

**Verdict:** ⚠️ Complementary, not replacement

**Use Cases:**
- Large features (multi-day work)
- When on mobile only
- Want CI validation
- Collaborative work

---

### Option 4: Claude Skills/Plugins

**Approach:**
- `/commit` skill with built-in approval
- `/pr` skill for PR creation
- Skills handle approval workflow

**Pros:**
- Seamless integration
- Simpler for LLM to use

**Cons:**
- Claude-specific (not portable)
- Skills don't exist yet
- Depends on Anthropic
- Less deterministic than bash scripts

**Verdict:** ⏳ Wait and see

**Strategy:** Build portable hooks first, integrate skills when available

---

## Decision: Branch-Aware Soft Determinism

### Main Branch (Production)
**Enforcement:** Hard (blocking)
- Requires `.commit-approval` file
- Blocks verbose messages
- No WIP commits allowed

### Feature Branches (Development)
**Enforcement:** Soft (warnings)
- Warns if message >5 lines
- Suggests concise version using conventional commits
- Allows commit to proceed
- LLM can see warning and self-correct

### Merge to Main
**Enforcement:** Via PR or manual squash
- PR description template reminds to squash
- CI validates commit messages in PR
- Squash merge cleans history automatically

## Implementation Details

### Pre-commit Hook Logic
```bash
#!/bin/bash
BRANCH=$(git branch --show-current)
APPROVAL_FILE=".commit-approval"

# Check 1: .worktrees/ in .gitignore (always)
[check and block if missing]

# Check 2: Branch-aware approval
if [ "$BRANCH" = "main" ]; then
  # HARD: Require approval file
  if [ ! -f "$APPROVAL_FILE" ]; then
    echo "❌ ERROR: No approval on main branch"
    exit 1
  fi

  if [ approval file stale ]; then
    echo "❌ ERROR: Stale approval"
    exit 1
  fi

  echo "✓ Commit approved"

else
  # SOFT: Warn if no approval, but allow
  if [ ! -f "$APPROVAL_FILE" ]; then
    echo "⚠️  WARNING: No approval file (feature branch - allowed)"
    echo ""
    echo "This commit will not be blocked, but consider:"
    echo "  1. Keep messages concise (1-2 lines)"
    echo "  2. Use conventional commits format"
    echo "  3. Details go in documentation, not commit messages"
    echo ""
    echo "Proceeding with commit..."
  fi
fi
```

### Commit-msg Hook Logic
```bash
#!/bin/bash
BRANCH=$(git branch --show-current)
MESSAGE_FILE="$1"
LINE_COUNT=$(grep -v '^#' "$MESSAGE_FILE" | grep -v '^$' | wc -l)

if [ "$BRANCH" = "main" ]; then
  # HARD: Block verbose messages
  if [ "$LINE_COUNT" -gt 5 ]; then
    echo "❌ ERROR: Message too long on main ($LINE_COUNT lines)"
    exit 1
  fi
else
  # SOFT: Warn but allow
  if [ "$LINE_COUNT" -gt 5 ]; then
    echo "⚠️  WARNING: Verbose message on feature branch ($LINE_COUNT lines)"
    echo ""
    echo "Current message:"
    grep -v '^#' "$MESSAGE_FILE" | head -3
    echo "..."
    echo ""
    echo "Suggested format:"
    echo "  <type>(<scope>): <what changed in 5-10 words>"
    echo ""
    echo "Proceeding anyway (feature branch)..."
  fi
fi
```

### LLM Self-Correction Loop

**When LLM sees warning:**
```
⚠️  WARNING: Verbose message on feature branch (12 lines)
Suggested format:
  <type>(<scope>): <what changed in 5-10 words>
Proceeding anyway (feature branch)...
```

**LLM can:**
1. **Self-correct:** "I see the warning. Let me amend with a concise message..."
2. **Ask user:** "The commit succeeded but was verbose. Should I amend it?"
3. **Explain:** "This is a WIP commit on feature branch, will squash before merging"

## Workflow Examples

### Example 1: Quick Fix on Main
```bash
# Claude: "Need to commit doc fix to main"
# Claude: [Creates .commit-approval with concise message]
# Claude: [Asks user approval]
# User: "yes"
# Claude: [Commits]
# Hook: ✓ Commit approved
# Result: Clean commit on main
```

### Example 2: Feature Branch WIP
```bash
# Claude: "Working on navigation filter feature"
# Claude: [Commits without approval]
# Hook: ⚠️  WARNING: No approval file (allowed)
# Claude: [Sees warning, notes for future]
# Result: WIP commit on feature branch
```

### Example 3: LLM Self-Correction
```bash
# Claude: [Writes verbose message, tries to commit]
# Hook: ⚠️  WARNING: Verbose message (12 lines)
#       Suggested: feat(nav): add filter support
# Claude: "I see. Let me amend..."
# Claude: [git commit --amend with concise message]
# Hook: ✓ Message validated
# Result: LLM corrected itself
```

### Example 4: PR to Main
```bash
# Claude: [Multiple WIP commits on feature branch]
# Claude: [Opens PR with: gh pr create --draft]
# User: [Reviews on mobile, requests squash]
# Claude: [Rebases/squashes to clean commits]
# User: [Approves and squash-merges]
# Result: Clean history on main
```

## Metrics to Track

**Success Indicators:**
- [ ] Zero verbose commits on main (except --no-verify emergencies)
- [ ] Feature branches have flexibility
- [ ] LLM successfully self-corrects when warned
- [ ] PR squash-merge workflow feels natural
- [ ] No complaints about "too restrictive"

**Failure Indicators:**
- [ ] Frequent --no-verify usage
- [ ] LLM confused by warnings
- [ ] Users bypass hooks
- [ ] Feature branch commits never cleaned up

## Future Enhancements

### Phase 1 (Current)
- ✅ Branch-aware hooks
- ✅ Soft warnings for feature branches
- ✅ Hard blocks for main

### Phase 2 (Next)
- [ ] GitHub Actions CI validation
- [ ] PR template with squash reminder
- [ ] Automated commit message suggestions in warnings

### Phase 3 (Future)
- [ ] Integrate Claude skills when available
- [ ] Machine learning: Learn from approved messages
- [ ] Auto-generate concise versions of verbose messages

## References

- CLAUDE.md: Commit approval workflow documentation
- docs/git_workflow.md: General git workflow
- .husky/pre-commit: Branch-aware enforcement implementation
- .husky/commit-msg: Message validation logic

## Review Date

Review this approach after 1 month of usage (March 2026) to assess effectiveness.
