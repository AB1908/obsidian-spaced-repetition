# Solo Developer Git & Documentation Workflow

## Philosophy

**Commits tell WHAT changed. Documentation tells WHY.**

- Keep commit messages concise (1-2 lines)
- Do not include story short-codes in commit subjects (`BUG-###`, `STORY-###`, `DEBT-###`, etc.)
- Put context, decisions, and rationale in markdown files
- Markdown is searchable, linkable, and easier to read than git history
- Future you (and contributors) will search docs, not git log

## Project Structure

See [Work Organization Guide](work-organization.md) for full directory layout, story conventions, and templates.

## Daily Workflow

### 1. Starting a Feature
```bash
# Create feature branch
git checkout -b feature/navigation-system

# Document what you're about to do
cat > docs/stories/STORY-015-navigation-system.md << 'EOF'
# STORY-015: Navigation System Implementation

## Status
In Progress

## Branch
feature/navigation-system

## User Story
As a user, I want direction-aware navigation controls for annotation browsing, so that I can easily move between highlights.

## Acceptance Criteria
- [ ] Basic navigation component
- [ ] Direction awareness
- [ ] Keyboard shortcuts
- [ ] Tests

## Context
See docs/decisions/ADR-XXX-navigation-routing.md

## Session Notes
- 2024-01-15: Initial setup and planning.
EOF

git add docs/stories/
git commit -m "docs: start navigation system work"
```

### 2. Working on the Feature

Commit freely and often (these will be squashed later):
```bash
git commit -m "wip: basic navigation"
git commit -m "wip: add direction support"
git commit -m "fix: broken import"
git commit -m "refactor: extract to hook"
git commit -m "fix: tests"
```

**Document decisions as you go:**
```bash
# When you make an important decision
cat > docs/decisions/ADR-015-custom-navigation.md << 'EOF'
# ADR-015: Custom Navigation Over React Router

## Status
Accepted

## Context
Need routing for flashcard navigation. React Router is standard but may not 
work in Obsidian's environment.

## Decision
Implement custom navigation system using browser History API

## Consequences

**Positive:**
- Full control over state management
- Better Obsidian API integration
- Lighter weight

**Negative:**
- Additional maintenance
- No ecosystem of plugins
- Need to implement common features ourselves

## Alternatives Considered
- React Router - too heavy, doesn't work with Obsidian
- Tanstack Router - overkill for our needs
- Wouter - considered but wanted more control

## References
- Obsidian API limitations: [link]
- Discussion in issue #42
EOF

git add docs/decisions/
git commit -m "docs: document navigation routing decision"
```

### 3. Before Merging - Clean Up Commits

**Use the LLM prompt above**, or manually:
```bash
# Review your work
git log --oneline main..HEAD

# Interactive rebase to squash
git rebase -i main

# In the editor, squash WIP and fix commits:
pick abc1234 docs: start navigation system work
squash def5678 wip: basic navigation
squash ghi9012 wip: add direction support
squash jkl3456 fix: broken import
pick mno7890 docs: document navigation routing decision
squash pqr1234 refactor: extract to hook
squash stu5678 fix: tests
```

**Result: 2 clean commits**
```
docs: start navigation system work
feat: implement direction-aware navigation system
```

### 4. Update Documentation Before Merging
```bash
# Update CHANGELOG.md
cat >> CHANGELOG.md << 'EOF'
## [Unreleased]

### Added
- Direction-aware navigation controls for annotations [STORY-015]
- Keyboard shortcuts for navigation (← →)
- Auto-save during navigation

### Technical
- Custom navigation system (see docs/decisions/ADR-015-custom-navigation.md)

EOF

# Update the story file
# - Mark Status as Done
# - Add any final session notes
# - Link to any durable guides created

# Create or update durable guides if this feature introduced 
# long-term knowledge (e.g., API quirks, complex logic explanations)
cat > docs/guides/navigation-notes.md << 'EOF'
# Navigation System Notes

## 2024-01-16: Arrow key event bubbling
Obsidian's core navigation sometimes swallows arrow keys. 
Ensure `stopPropagation()` is called in the handler.
EOF

# Update TODO if needed (using DEBT or IDEA prefixes)
cat > docs/stories/IDEA-002-mobile-navigation.md << 'EOF'
# IDEA-002: Mobile Swipe Gestures for Navigation

## Description
Add swipe gestures to AnnotationView for better mobile experience.
EOF

# Commit documentation updates
git add docs/ CHANGELOG.md
git commit -m "docs: finalize navigation system"
```

### 4.1 Pre-Merge Discipline Checklist (Manual Gate)

Before merging, explicitly verify:

- `CHANGELOG.md` updated for user-facing changes.
- Story status is `Done` in `docs/stories/<ITEM>.md`.
- A session note exists for the latest execution in `docs/sessions/YYYY-MM-DD-<ITEM>.md`.
- If implementation diverged from the approved plan, the plan is updated and re-approved before final merge.

### 4.2 Deterministic History-Curation Gate

When a branch has more than 6 commits over `main`, do not merge directly.

Required:
- Add topology snapshots to an execution log file in `docs/executions/`:
  - `## Planned Commit Topology`
  - `## Actual Commit Topology`
  - `## Final Curated Topology`
- Record explicit approval line: `History Curation Approved: yes`
- Curate history before merge (squash/rebase/cherry-pick strategy)

Automation:
- `scripts/require-history-curation.sh` enforces the `>6` commit policy.
- Script checks `docs/executions/` first; story/plan are compatibility fallback.
- `scripts/safe-merge.sh <source-branch> [base-branch]` runs the gate then performs `--ff-only` merge.
- `.husky/pre-merge-commit` runs the same gate for non-fast-forward merges.

Important:
- Git hooks cannot fully gate fast-forward merges unless you use a wrapper command.
- Use `scripts/safe-merge.sh` as the default local merge entrypoint.

Delegated execution note:
- For delegated worktree runs, pass `--base` explicitly.
- Keep `docs/executions/raw/` as forensic logs and prefer `docs/executions/semantic/` for reviewable summaries.

### 5. Merge to Main

**Choose your merge strategy based on what you want in history:**

#### Strategy A: Linear History with Atomic Commits (RECOMMENDED)

Use this when you've rebased and want each atomic commit visible in main's history.

```bash
git checkout main
git merge feature/navigation-system  # Fast-forward merge (no --no-ff!)

# Tag if it's a release
git tag -a 0.3.0 -m "0.3.0: Navigation system"
git push origin main --tags
```

**Result:** Linear history showing all your atomic commits:
```
* c0ce8f5 chore(test): remove obsolete api.test.ts snapshot
* 79d1ce8 fix(test): AnnotationsNote tests use existing disk mocks
* a299362 docs: update roadmap, analyze model coupling
* 9870e40 refactor(model): rename SourceNote to AnnotationsNote
```

**When to use:**
- You rebased/squashed commits to create a clean history
- You want atomic commits visible for easier debugging/bisecting
- You're working solo and history clarity matters more than branch tracking

#### Strategy B: Merge Commit with Feature Branch (ALTERNATIVE)

Use this when you want to preserve the branch boundary and group related commits.

```bash
git checkout main
git merge feature/navigation-system --no-ff -m "feat: add navigation system

Implements direction-aware navigation for annotations.
See CHANGELOG.md and docs/stories/STORY-015-navigation-system.md for details."

# Tag if it's a release
git tag -a 0.3.0 -m "0.3.0: Navigation system"
git push origin main --tags
```

**Result:** Non-linear history with merge commit:
```
*   b3c94d9 Merge branch 'feature/navigation-system'
|\
| * c0ce8f5 chore(test): remove obsolete snapshot
| * 79d1ce8 fix(test): use existing disk mocks
| * a299362 docs: update roadmap
| * 9870e40 refactor(model): rename SourceNote
|/
* 5211820 docs: add navigation bug analysis
```

**When to use:**
- Working with collaborators who need to see branch history
- You want to group a feature's commits together
- You don't mind non-linear history

#### If You Accidentally Used --no-ff After Rebasing

If you rebased to create atomic commits but accidentally used `--no-ff` and now have a merge commit bundling your work:

```bash
# 1. Reset to before the merge (assuming last commit is the merge)
git reset --hard HEAD^1

# 2. Fast-forward merge instead
git merge feature/navigation-system

# 3. Force-push if already pushed to remote
git push --force-with-lease origin main
```

## Documentation Templates

See [Work Organization Guide](work-organization.md) for story templates, ADR templates, and documentation conventions.
