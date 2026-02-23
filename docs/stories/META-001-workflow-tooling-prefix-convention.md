# META-001: Establish META Prefix for Workflow and Tooling Work

## Status
Done

## Description

Plugin work (STORY, BUG, DEBT) and workflow/tooling work were mixed in the same story
catalog, polluting the release path and making it hard to distinguish user-facing changes
from internal development infrastructure improvements.

The META prefix separates this class of work:

**META covers:**
- Delegation scripts (`scripts/delegate-codex-task.sh`, `safe-merge.sh`, etc.)
- Agent workflow conventions (`.claude/agents.md`, plan templates)
- Story catalog tooling (`scripts/story-catalog.sh`)
- Execution infrastructure (semantic logs, contract verification)
- Session workflow documentation (`docs/guides/workflow.md`, `docs/guides/work-organization.md`)
- Hooks and commit enforcement

**Does NOT cover:**
- Plugin source code bugs → BUG
- Plugin features → STORY
- Plugin technical debt (src/, tests/) → DEBT
- Architecture decisions → ADR in `docs/decisions/`

## Reclassified items
- DEBT-033 → META-002 (deterministic execution protocol)
- DEBT-034 → META-003 (delegated test-contract enforcement)
- DEBT-038 → META-004 (delegation observability and guardrails)

## Acceptance Criteria
- [x] META prefix documented here
- [x] Existing DEBT items that are pure workflow work reclassified as META
- [x] Future workflow work filed as META from the start
