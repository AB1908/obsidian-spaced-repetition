# SPIKE-004: Worktree Agent Orchestration Tooling Evaluation

## Status
Backlog

## Epic
None

## Depends on
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md) - active lane execution baseline

## User Story
As a maintainer, I want to evaluate existing orchestration tooling for multi-worktree agent execution so that we can reduce custom operational overhead if a reliable solution already exists.

## Scope
Evaluate off-the-shelf tools versus local scripts for:
- lane/session lifecycle
- progress monitoring and resume
- intervention/rollback ergonomics
- safety rails around destructive git operations

## Candidate Inputs (initial)
- tmux orchestrators (`tmuxp`, `teamocil`)
- git worktree wrappers (`git-worktree-manager`)
- task runners (`just`, `task`) with session wrappers

## Acceptance Criteria
- [ ] Compare at least 3 candidate approaches against current script (`scripts/agent-lanes.sh`)
- [ ] Document recommendation: keep local script vs adopt external tooling
- [ ] If migration is recommended, define a minimal adoption plan and rollback path

## Related
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md)
