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
│   ├── features/          # Feature documentation
│   ├── todo/              # Organized TODO lists
│   └── context/           # Work-in-progress context
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
cat > docs/context/navigation-system.md << 'EOF'
# Navigation System Implementation

## Goal
Implement direction-aware navigation controls for annotation browsing

## Started
2024-01-15

## Current Status
- [ ] Basic navigation component
- [ ] Direction awareness
- [ ] Keyboard shortcuts
- [ ] Tests

## Key Decisions
See docs/decisions/ADR-XXX-navigation-routing.md

## Notes
- Consider mobile gestures later
- May need to refactor ImportFlow
EOF

git add docs/context/
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
- Direction-aware navigation controls for annotations
- Keyboard shortcuts for navigation (← →)
- Auto-save during navigation

### Technical
- Custom navigation system (see docs/decisions/ADR-015-custom-navigation.md)
- NavigationControl component extracted to reusable hook

EOF

# Update feature docs
cat > docs/features/navigation.md << 'EOF'
# Navigation System

## Overview
Allows users to navigate through annotations using arrow keys or buttons.

## Usage
```tsx
import { useNavigation } from './hooks/useNavigation';

const { goNext, goPrev, canGoNext, canGoPrev } = useNavigation();
```

## Architecture
See docs/decisions/ADR-015-custom-navigation.md

## Components
- `NavigationControl` - UI component
- `useNavigation` - Navigation logic hook

## Testing
Run `npm test navigation` for full test suite
EOF

# Move context to archive
mv docs/context/navigation-system.md docs/context/archive/

# Update TODO if needed
cat >> docs/todo/features.md << 'EOF'
## Navigation Improvements
- [ ] Add swipe gestures for mobile (priority: medium)
- [ ] Prefetch next annotation for faster navigation (priority: low)
- [ ] Add navigation history/breadcrumbs (priority: low)
EOF

# Commit documentation updates
git add docs/ CHANGELOG.md
git commit -m "docs: update for navigation system"
```

### 5. Merge to Main
```bash
git checkout main
git merge feature/navigation-system --no-ff -m "feat: add navigation system

Implements direction-aware navigation for annotations.
See CHANGELOG.md and docs/features/navigation.md for details."

# Tag if it's a release
git tag -a v0.3.0 -m "v0.3.0: Navigation system"
```

## Documentation Templates

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

### Work Context

**Template:** `docs/context/[feature-name].md`
```markdown
# [Feature Name]

## Goal
One sentence describing what we're building and why

## Timeline
- Started: YYYY-MM-DD
- Target: YYYY-MM-DD
- Status: [Planning | In Progress | Blocked | Complete]

## Progress Checklist
- [ ] Task 1
- [ ] Task 2
- [x] Completed task

## Technical Approach
Brief description or link to architecture doc

## Open Questions
- Question 1?
- Question 2?

## Blockers
- Blocker 1 (waiting on...)
- Blocker 2

## Notes
Random thoughts, links, discoveries during implementation

## Related
- Issues: #XX
- ADRs: ADR-XXX
- PRs: (if not solo)
```

### Feature Documentation

**Template:** `docs/features/[feature-name].md`
```markdown
# [Feature Name]

## Overview
What does this feature do? Who is it for?

## Usage

### Basic Example
```typescript
// code example
```

### Advanced Usage
```typescript
// advanced example
```

## Architecture
Brief overview or link to docs/architecture/

Key design decisions: see docs/decisions/ADR-XXX

## API Reference
Brief API docs or link to generated docs

## Configuration
Any settings or environment variables

## Testing
How to test this feature

## Troubleshooting
Common issues and solutions

## Future Improvements
- Potential enhancement 1
- Potential enhancement 2

## Related
- Dependencies: X, Y, Z
- Related features: A, B
```

### TODO Organization

**Template:** `docs/todo/[category].md`
```markdown
# [Category] TODO

## High Priority
- [ ] Critical bug in X (issue #42)
- [ ] Must-have feature Y (requested by 5 users)

## Medium Priority
- [ ] Refactor Z for better performance
  - Created during navigation work
  - See commit abc1234
  - Estimated: 2 days

## Low Priority / Nice to Have
- [ ] Add feature A
- [ ] Improve UX for B

## Technical Debt
- [ ] NavigationControl needs more tests
  - Created: 2024-01-15
  - Risk: Medium (could break mobile)
  - Location: src/components/Navigation/
  
- [ ] Import path matching is fragile
  - Quick fix in commit def5678
  - Needs proper refactor
  - Estimated: 3 days

## Research / Exploration
- [ ] Investigate using X library
- [ ] Prototype Y approach

## Blocked
- [ ] Feature Z (waiting on upstream dependency)
```

## When to Document What

| Event | Document Where | Commit Message |
|-------|---------------|----------------|
| Start feature | `docs/context/feature.md` | `docs: start [feature] work` |
| Make decision | `docs/decisions/ADR-XXX.md` | `docs: document [decision]` |
| Complete feature | `docs/features/feature.md` | `docs: add [feature] documentation` |
| Find tech debt | `docs/todo/category.md` | Include in feature commit |
| User-facing change | `CHANGELOG.md` | Include before merge |
| API change | Update `README.md` or `docs/` | `docs: update [component] docs` |