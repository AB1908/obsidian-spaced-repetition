# META-013: Formalize Scattered ADRs

## Status
Ready

## Description
Architectural decisions have accumulated in session logs, story files, and plans without formal ADR documentation. At least 8 decisions need extraction:

### Candidates (from session/story audit)
1. **ADR-021**: Build-time module redirection for fixture capture (esbuild plugin)
2. **ADR-022**: Discriminated union for BookSections
3. **ADR-023**: Source discovery policy at application layer
4. **ADR-024**: Storage port + Obsidian adapter boundary
5. **ADR-025**: API module decomposition for verification throughput
6. **ADR-026**: Unified filter policy module
7. **ADR-027**: Fixture capture workflow and naming convention
8. **ADR-028**: Incremental commit discipline

Plus 3 lightweight conventions for guides (session notes location, agent attribution, commit convention).

### Approach
Batch extraction — read source artifacts, write ADR files following existing format in `docs/decisions/`. Could be a periodic skill ("extract ADRs from recent sessions").

## Impact
Low — documentation debt. Important for onboarding and decision traceability.

## Related
- All session logs in `docs/sessions/`
- Existing ADRs in `docs/decisions/`
