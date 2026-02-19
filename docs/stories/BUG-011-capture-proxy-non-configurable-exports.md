# BUG-011: Capture Proxy Cannot Redefine Non-Configurable CJS Exports

## Status
Done

## Branch
chore/polish-usable-version-2026-02-17

## Description
Follow-up to BUG-010. The `Object.defineProperty` fix for getter-only exports also fails because esbuild's `__export` helper creates **non-configurable** properties:

```javascript
// esbuild's __export calls __defProp with no configurable flag (defaults to false)
__export(disk_exports, {
  createFile: () => createFile,
  // ...
});
```

`Object.defineProperty` throws `TypeError: Cannot redefine property: createFile` because the existing descriptor has `configurable: false`.

### Root Cause
Runtime monkey-patching of esbuild's CJS module exports is fundamentally impossible — properties are non-configurable getters with closure-captured local variables.

### Error
```
Plugin failure: card-coverage TypeError: Cannot redefine property: createFile
    at Function.defineProperty (<anonymous>)
    at wrapDiskForCapture (plugin:card-coverage:32201:14)
```

### Fix
Abandon runtime patching. Use an **esbuild plugin** to redirect disk module imports to a capture-proxy wrapper at build time. This is a clean build-time solution:
- When `CAPTURE_FIXTURES_DIR` is set, esbuild resolves all `src/infrastructure/disk` imports to `src/utils/capture-disk.ts` instead
- `capture-disk.ts` imports the real disk module, wraps it with `createCaptureProxy`, and re-exports
- No runtime patching needed, no modification of non-configurable properties

## Related
- [BUG-010](BUG-010-capture-proxy-getter-only-exports.md) — predecessor (getter-only, solved wrong)
- [DEBT-010](DEBT-010-capture-fixture-cycle.md) — parent story
