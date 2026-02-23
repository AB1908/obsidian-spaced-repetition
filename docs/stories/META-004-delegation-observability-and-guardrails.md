# META-004: Delegation Observability and Guardrails

## Status
Ready

## Description

Several gaps in the delegation workflow surfaced during STORY-025 execution:

### 1. Double-backgrounding drops post-run steps

When `run_in_background: true` is used in the Bash tool, the tool already handles
backgrounding. Adding `&` to the command creates a double-background: the delegate
script runs detached from the tool's lifecycle. The background task reports exit code 0
from the wrong process while post-run steps (contract check, semantic log) run unobserved.

**Fix:** Never add `&` when using `run_in_background: true`. Documented in `agents.md`.

### 2. Delegation command not recorded in plans

No record of the exact command used, making re-runs and diagnosis harder.

**Fix:** Add `## Delegation` section to plan template with full `delegate-codex-task.sh`
invocation. Documented in `agents.md`.

### 3. Base branch not explicit in plans

**Fix:** Plans include `--base main` in the Delegation section.

### 4. Semantic log skipped on contract failure

Confirmed semantic log IS written before `exit 1` in current script — root cause was
the double-`&` issue above. No script change needed.

## Acceptance Criteria
- [x] `agents.md` documents: never use `&` with `run_in_background: true`
- [x] Plan template in `agents.md` includes `## Delegation` section
- [x] `agents.md` updated with `--base` convention
- [ ] Delegation command recorded in all future plans before delegating

## Related
- [META-002](META-002-deterministic-execution-protocol.md)
- [META-003](META-003-delegated-test-contract-enforcement.md)
