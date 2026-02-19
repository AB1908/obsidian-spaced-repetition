# DEBT-023: Storage Port + Obsidian Adapter Boundary

## Status
Ready

## Epic
None

## Description
Current layering conflates storage concerns:
- Obsidian facade exposes runtime APIs.
- `disk.ts` includes infrastructure plus domain/path policy logic.
- `api.ts` still calls disk methods directly in some flows.

To support future non-Obsidian runtimes (for example React Native), introduce an explicit storage port contract and keep Obsidian-specific implementation behind an adapter.

## Proposed Direction
1. Define `StoragePort` interface (read/write/move/metadata/tag operations).
2. Implement `ObsidianStorageAdapter` using the facade.
3. Move path/naming/mutation policy into domain/services (not adapter).
4. Enforce rule: app API/orchestration layers do not call infrastructure helpers directly.

## Acceptance Criteria
- [ ] `StoragePort` contract exists and is documented.
- [ ] Obsidian adapter is explicit implementation of the port.
- [ ] Domain-level path/name policies no longer live in storage adapter code.
- [ ] New/updated tests target the port contract, not Obsidian internals.

## Likely Touchpoints
- `src/infrastructure/obsidian-facade.ts`
- `src/infrastructure/disk.ts`
- `src/data/models/**`
- `src/api.ts` (or decomposed modules)
- `tests/helpers.ts` and fixture usage patterns

## Related
- [DEBT-006](DEBT-006-disk-business-logic.md)
- [DEBT-007](DEBT-007-flashcard-persistence-pattern.md)
- [DEBT-013](DEBT-013-source-polymorphism.md)
