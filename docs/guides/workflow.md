# Solo Developer Git & Documentation Workflow

## Philosophy

**Commits tell WHAT changed. Documentation tells WHY.**

- Keep commit messages concise (1-2 lines)
- Put context, decisions, and rationale in markdown files
- Markdown is searchable, linkable, and easier to read than git history
- Future you (and contributors) will search docs, not git log

## Project Structure
```
project-root/
├── docs/
│   ├── decisions/          # Architecture Decision Records (ADRs)
│   ├── architecture/       # System design docs
│   ├── stories/           # ALL work items: features, bugs, debt, ideas
│   ├── executions/        # Run-time execution logs: topology, approvals, integration
│   ├── guides/            # Reference material: testing, workflow, learnings
│   └── archive/           # Completed or stale context
├── CHANGELOG.md           # User-facing changes
├── DEVELOPMENT.md         # Developer guide
└── README.md             # Project overview
```

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
git commit -m "docs: start navigation system work [STORY-015]"
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
git commit -m "docs: finalize navigation system [STORY-015]"
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
git merge feature/navigation-system --no-ff -m "feat: add navigation system [STORY-015]

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

See [Work Organization Guide](work-organization.md) for Story, Bug, Debt, and Idea templates.

### Architecture Decision Record (ADR)

**Template:** `docs/decisions/ADR-NNN-title.md`
```markdown
# ADR-NNN: [Title]

## Status
[Proposed | Accepted | Deprecated | Superseded]

## Context
What is the issue we're trying to solve? What constraints do we have?

## Decision
What did we decide to do?

## Consequences

**Positive:**
- Benefit 1
- Benefit 2

**Negative:**
- Drawback 1
- Drawback 2

**Neutral:**
- Trade-off 1

## Alternatives Considered
- Option A - rejected because X
- Option B - rejected because Y

## References
- Related ADRs: ADR-XXX
- Issues: #42, #56
- External resources: [links]

## Implementation Notes
Brief technical details if helpful

## Review Date
[Optional: when to reconsider this decision]
```

## When to Document What

| Event | Document Where | Commit Message |
|-------|---------------|----------------|
| Start feature | `docs/stories/STORY-N.md` | `docs: start [feature] [STORY-N]` |
| Make decision | `docs/decisions/ADR-XXX.md` | `docs: document [decision] [STORY-N]` |
| Complete feature | Update `docs/stories/STORY-N.md` | `docs: finalize [feature] [STORY-N]` |
| Find tech debt | `docs/stories/DEBT-N.md` | Include in feature commit |
| User-facing change | `CHANGELOG.md` | Include before merge |
| Durable knowledge | `docs/guides/topic.md` | `docs: update [topic] guide` |

---

## Advanced Workflow: Parallel Development with `ccmanager`

For complex projects, it's often necessary to work on multiple features in parallel. To prevent interference between these tasks, we use a "Dual-Level" workflow facilitated by `ccmanager`, which manages separate `git worktree` environments for each task.

### The "Dual-Level" Concept

1.  **Level 1: The "Project Director" Session**
    *   **Location:** The project's root directory.
    *   **Purpose:** High-level strategic planning. This is where you analyze requirements, review user stories, define task boundaries, and manage the lifecycle of implementation workspaces.
    *   **Tools:** A `gemini` session for planning, and `ccm` commands for workspace management.

2.  **Level 2: The "Feature Implementer" Session**
    *   **Location:** Inside a dedicated, isolated worktree directory (e.g., `.worktrees/<feature-name>`).
    *   **Purpose:** Deep, focused work on a single feature. This includes writing code, running tests, and committing changes to the feature branch.
    *   **Tools:** A dedicated `gemini` session for implementation.

### Example Step-by-Step Workflow

1.  **Start at Level 1 (Project Root)**
    *   Open your terminal in the project root.
    *   Start a `gemini` session to plan your work.
    *   **Prompt:** "Let's review our user stories and decide on the next feature to implement."
    *   After deciding on a task (e.g., "Implement new export format"), exit the `gemini` session.

2.  **Delegate to Level 2**
    *   In the same terminal, use `ccmanager` to create a new workspace for the task:
        ```bash
        ccm start feature/new-export-format
        ```
    *   `ccmanager` will create a new branch and a corresponding worktree in `./.worktrees/`.

3.  **Work at Level 2 (New Terminal)**
    *   Open a **new terminal window or tab**.
    *   Navigate into the newly created worktree:
        ```bash
        cd .worktrees/feature-new-export-format
        ```
    *   Start a new, dedicated `gemini` session for implementation.
    *   **Prompt:** "We're implementing the new export format. Let's begin by..."
    *   Proceed with coding, testing, and committing your work on the feature branch. This session's context is entirely isolated to this task.

4.  **Return to Level 1 to Integrate**
    *   Once the feature is complete and all changes are committed, close the Level 2 terminal.
    *   Return to your **original Level 1 terminal**.
    *   Use `ccmanager` to merge the completed work and clean up the workspace:
        ```bash
        ccm close feature/new-export-format --merge
        ```
    *   This merges the feature branch into `main` and removes the worktree and branch. You are now ready to plan the next task from your "Project Director" context.
