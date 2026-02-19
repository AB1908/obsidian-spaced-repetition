# Session Plan: DEBT-026 + Related Debt (2026-02-17)

## Situation Analysis

### DEBT-026 Status: ~90% Already Done
The production fixtures have **already been sanitized** in a previous session:
- All 13 `getFileContents_*.json` files use lorem ipsum / dummy content
- All 32 small-output fixtures are safe (paths, tags, config — no prose)
- 13 `getMetadata/getTFile` fixtures remain — these contain only **structural metadata** (positions, offsets, section types, heading objects). The only "real" content is:
  - **Chapter headings** from published books (public info, not personal)
  - **Book file paths** referencing real book titles (public info)
  - One Anthropic constitution description (public, from anthropic.com)

**Verdict:** DEBT-026 is essentially **complete**. The metadata fixtures contain zero personal content — only book titles and chapter headings which are public. We should mark it Done with a brief verification note.

### Related Debt Available
| Item | Status | Complexity | Value |
|------|--------|------------|-------|
| DEBT-027 (Formalize scattered ADRs) | Ready | Medium — 8 ADRs to extract from session logs | Medium — documentation traceability |
| DEBT-028 (Enforce session/divergence checks) | Ready | Low — add 1 line to CLAUDE.md (already done via file change), verify hooks | Medium — workflow discipline |

### Sensitive Branch on Remote
You mentioned accidentally pushing a branch with sensitive data. This is **urgent** — the longer it stays, the more likely it gets cached/forked. Recommend deleting it immediately after this plan review.

---

## Multi-Agent Delegation Strategy

### Tool Profiles

| Tool | Best For | Avoid For | Cost Profile |
|------|----------|-----------|-------------|
| **Claude Code (Opus 4.6)** | Architecture decisions, complex refactors, multi-file reasoning, agentic workflows, this project's CLAUDE.md-heavy workflow | Bulk repetitive tasks, documentation generation | Constrained — use for high-value work only |
| **Gemini CLI** | Planning docs, ADR extraction from session logs, large-context tasks (1M tokens), bulk file processing, front-end work | Complex logic, tasks needing strict intent adherence | Free/high limits — use liberally |
| **Codex 5.3** | Rapid prototyping, boilerplate, code review, straightforward implementation tasks, test writing | Novel architecture decisions, tasks requiring deep project context | High limits — good workhorse |

### Delegation Matrix for Current Backlog

| Task | Assign To | Rationale |
|------|-----------|-----------|
| **DEBT-026 verification & close** | Claude Code | Already here, 2 minutes of work |
| **DEBT-027: Extract 8 ADRs** | **Gemini CLI** | Perfect fit: read session logs (large context), extract decisions into templated ADR files. Repetitive structured extraction. Low risk of intent deviation since ADRs follow a strict template. |
| **DEBT-028: Enforce workflow checks** | **Claude Code** | Already partially done (CLAUDE.md updated). Needs careful reasoning about hook behavior. Small, high-precision task. |
| **Delete sensitive remote branch** | Manual / Claude Code | One command, but needs your confirmation on branch name |
| Future: DEBT-022 (API decomposition) | Claude Code | Architecture-heavy, needs deep reasoning |
| Future: DEBT-024 (filter policy) | Codex 5.3 | Implementation-focused once design is decided |
| Future: Test writing batches | Codex 5.3 | Good at boilerplate test generation |

---

## Proposed Execution Order

### Phase 1 — This Session (Claude Code)
1. **Close DEBT-026**: Update status to Done, add verification note
2. **Close DEBT-028**: Verify the CLAUDE.md change covers it, update status
3. **Commit** both story status updates

### Phase 2 — Parallel (Gemini CLI)
4. **DEBT-027**: Hand off ADR extraction to Gemini CLI with a structured prompt:
   - Read all `docs/sessions/*.md` files
   - Read existing ADR format from `docs/decisions/`
   - Extract the 8 identified decisions into ADR files
   - Follow existing numbering (ADR-021 through ADR-028)

### Phase 3 — After Gemini delivers
5. **Review** Gemini's ADR output in Claude Code (quality gate)
6. **Commit** the ADR batch

---

## Gemini CLI Prompt (Ready to Copy-Paste)

```
Read all files in docs/sessions/ and docs/decisions/ in this repo.

Extract these 8 architectural decisions into individual ADR files following
the exact format of existing ADRs in docs/decisions/:

1. ADR-021: Build-time module redirection for fixture capture (esbuild plugin)
2. ADR-022: Discriminated union for BookSections
3. ADR-023: Source discovery policy at application layer
4. ADR-024: Storage port + Obsidian adapter boundary
5. ADR-025: API module decomposition for verification throughput
6. ADR-026: Unified filter policy module
7. ADR-027: Fixture capture workflow and naming convention
8. ADR-028: Incremental commit discipline

For each ADR:
- Extract the decision context, rationale, and consequences from session logs
- If a decision isn't clearly documented in sessions, create a minimal ADR
  with Status: Draft and note "Needs expansion from team knowledge"
- Save as docs/decisions/ADR-0XX-<kebab-case-title>.md
```

---

## Approval Requested

Phase 1 is ready to execute now. Approve to proceed?
