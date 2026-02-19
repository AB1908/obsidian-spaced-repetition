# Capture Fixtures from Production Vault

Captures real Obsidian API output as JSON fixture files for use in tests.

## Prerequisites

- Desktop Obsidian (capture uses Node `fs` — not available on mobile)
- Plugin installed in your vault via `OBSIDIAN_PLUGIN_DIR` in `.env`

## Quick Start

```bash
npm run capture        # builds plugin with capture mode on
# → Reload Obsidian (or let hot-reload pick it up)
# → Navigate the plugin UI to trigger disk calls
# → Fixtures appear in tests/fixtures/
npm run dev            # restore normal build
```

## How It Works

1. `npm run capture` sets `CAPTURE_FIXTURES_DIR=$(pwd)/tests/fixtures` and builds the plugin
2. esbuild injects `__CAPTURE_MODE__: true` and `__CAPTURE_FIXTURES_DIR__` as compile-time constants
3. `main.ts` calls `wrapDiskForCapture()` which patches all `disk.ts` exports with a Proxy
4. Every disk function call writes a JSON file: `{ method, capturedAt, capturedFrom, input, output }`
5. Filename format: `methodName_timestamp_random.json` (append mode — never overwrites)

## After Capture

1. **Identify** new fixtures in `tests/fixtures/` (sort by date)
2. **Rename** to semantic names following the convention:
   ```
   <method>_<source>_<qualifier>.json
   ```
   Examples:
   - `getFileContents_atomichabits_annotations.json`
   - `getMetadataForFile_atomichabits_annotations.json`
   - `getTFileForPath_atomichabits.json`
3. **Delete** unwanted captures (capture records ALL disk calls, not just your target)
4. **Add** fixture filenames to the `createDiskMockFromFixtures([...])` array in `tests/api.test.ts`
5. **Write tests** using the new fixtures
6. **Run** `npm test` to verify

## Special: fileTags Fixture

`fileTags()` returns ALL files' tags as a Map. When you capture, it records the entire vault's tag data. If adding a new source to tests, you'll need to either:
- Replace the existing fileTags fixture with the new capture (recommended — more faithful)
- Manually merge new entries into the existing fixture

## Naming Convention

| Method | Example Filename |
|--------|-----------------|
| `getFileContents` | `getFileContents_atomichabits_annotations.json` |
| `getMetadataForFile` | `getMetadataForFile_atomichabits_annotations.json` |
| `getTFileForPath` | `getTFileForPath_atomichabits.json` |
| `fileTags` | `fileTags_all.json` |
| `filePathsWithTag` | `filePathsWithTag_reviewbook.json` |

## WSL + Windows Obsidian

The plugin runs in Obsidian's Electron process on **Windows**, but the repo lives in **WSL**. The `npm run capture` script uses `wslpath -w` to convert the WSL fixtures path to a Windows UNC path (`\\wsl$\Ubuntu\...`) that Obsidian's Node.js can write to.

## Known Limitations

- **Desktop only**: `fs` module not available in Obsidian Mobile
- **Captures everything**: All disk calls during the session are recorded, not just your target source
- **Append mode**: Files are never overwritten; manual cleanup needed after each capture session
- **WSL path translation**: `npm run capture` uses `wslpath` to produce a Windows-accessible UNC path. If your WSL distro name differs from "Ubuntu", check the path.

## Related

- [DEBT-010](../stories/DEBT-010-capture-fixture-cycle.md) — Story tracking this workflow
- [Testing Guide](testing.md) — How fixtures are used in tests
- `tests/helpers.ts` — `createDiskMockFromFixtures()` implementation
- `src/utils/captureProxy.ts` — Capture proxy implementation
