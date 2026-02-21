# SPIKE-008: Agent Safety Sandbox and K8s Execution Baseline

## Status
Backlog

## Epic
None

## Depends on
- [SPIKE-005](SPIKE-005-intent-contract-and-drift-loop.md)
- [SPIKE-007](SPIKE-007-cross-agent-prompt-harmonization.md)

## User Story
As a maintainer, I want agent sessions to run in safer isolated environments with explicit resource and privilege controls, so that accidental or malicious actions cannot impact my host machine or sensitive systems.

## Problem
Agentic execution currently has too much trust and host-level coupling (tool installation, shell access, broad permissions), which increases operational and security risk.

## Scope
Define a practical baseline for running agent jobs with:
1. sandboxed runtime boundaries
2. least-privilege permissions
3. network egress controls
4. reproducible logging/audit trails
5. human approval gates for high-risk actions

## Initial Direction
- Containerize agent sessions first (single-node/local baseline)
- Add resource controls (`cpu`, memory, disk limits) and non-root execution
- Add network allowlisting for required domains only
- Add command transcript + diff audit capture per run
- Define escalation policy for privileged commands/install steps

## K8s-Oriented Follow-up (later phase)
- Represent runs as jobs with explicit spec/status
- Add reconciliation loop for failed/partial runs
- Add queueing and concurrency limits
- Add policy checks before job admission

## Acceptance Criteria
- [ ] Baseline runbook exists for safe agent session setup (local/container-first)
- [ ] At least one pilot run executes successfully in sandbox mode with audit logs
- [ ] High-risk operations require explicit approval path
- [ ] Clear migration plan from local containers to k8s jobs if/when scale justifies it

## Non-Goals (v0)
- No production-grade cluster orchestration yet
- No complex multi-tenant platform in first iteration

## Related
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md)
- [SPIKE-005](SPIKE-005-intent-contract-and-drift-loop.md)
- [SPIKE-006](SPIKE-006-reusable-agent-skill-wrappers.md)
- [SPIKE-007](SPIKE-007-cross-agent-prompt-harmonization.md)
