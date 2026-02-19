# BUG-010: Capture Proxy Fails on Getter-Only CJS Exports

## Status
Done

## Branch
chore/polish-usable-version-2026-02-17

## Description
`wrapDiskForCapture()` used `Object.assign(diskModule, proxied)` to patch disk.ts exports in-place. This throws `TypeError: Cannot set property createFile of #<Object> which has only a getter` because esbuild's CJS output defines ESM re-exports as getter-only properties via `__defProp(exports, "name", { get: () => fn })`.

### Root Cause
esbuild converts ESM `export function foo()` to CJS getters, not writable properties. `Object.assign` calls the setter, which doesn't exist.

### Fix
Replace `Object.assign` with `Object.defineProperty` loop that overwrites each getter with a writable value pointing to the proxied function.

### Error
```
Plugin failure: card-coverage TypeError: Cannot set property createFile of #<Object> which has only a getter
    at Function.assign (<anonymous>)
    at wrapDiskForCapture (plugin:card-coverage:32199:10)
    at SRPlugin.eval (plugin:card-coverage:32247:13)
```

## Related
- [BUG-011](BUG-011-capture-proxy-non-configurable-exports.md) — follow-up: defineProperty also fails
- [DEBT-010](DEBT-010-capture-fixture-cycle.md) — parent story
