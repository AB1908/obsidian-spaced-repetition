# SPIKE-007: Cross-Agent Prompt and Context Harmonization

## Status
Backlog

## Epic
None

## Depends on
- [SPIKE-006](SPIKE-006-reusable-agent-skill-wrappers.md) - shared workflow wrapper definitions

## User Story
As a maintainer, I want Codex, Gemini, and Claude to operate from a comparable baseline of context and operating rules, so that behavior differences reflect model capability rather than prompt maturity drift.

## Problem
Agent instructions evolved unevenly over time, causing:
- inconsistent execution style between agents
- different assumptions about guardrails and quality bars
- “prompt versioning” drift where one agent appears more mature due to richer context

## Scope
Create a harmonization plan that:
1. inventories current agent-specific instruction sets
2. extracts a shared baseline contract
3. defines approved agent-specific deltas only where necessary
4. introduces lightweight versioning/changelog for prompt updates

## Acceptance Criteria
- [ ] Produce side-by-side comparison matrix of Codex/Gemini/Claude instructions
- [ ] Define shared baseline sections (must-match across agents)
- [ ] Define allowed divergence sections (agent/tool-specific)
- [ ] Add versioning metadata for prompt bundles (version + changelog)
- [ ] Pilot one run where all agents use the harmonized baseline

## Non-Goals
- No attempt to force identical outputs across different models
- No heavy governance workflow in v0

## Related
- [SPIKE-003](SPIKE-003-prototype-acceleration-parallel-execution-plan.md)
- [SPIKE-006](SPIKE-006-reusable-agent-skill-wrappers.md)
