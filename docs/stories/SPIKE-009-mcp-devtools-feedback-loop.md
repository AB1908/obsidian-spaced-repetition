# SPIKE-009: MCP Browser DevTools for Self-Healing Feedback Loop

## Status
Backlog

## Description
When testing Obsidian plugins, errors appear in the browser DevTools console (Electron). Currently, the developer must manually read the error, copy it, and feed it back to the agent for diagnosis.

An MCP-based browser DevTools integration could:
1. Automatically extract console errors/warnings from Obsidian's Electron DevTools
2. Feed them back to the agent in real-time
3. Enable a self-healing loop: agent makes change → plugin reloads → error detected → agent diagnoses and fixes

### Potential Approaches
- **MCP Chrome DevTools Protocol server**: Connect to Obsidian's Electron via CDP, subscribe to `Runtime.consoleAPICalled` and `Runtime.exceptionThrown` events
- **Custom Obsidian plugin**: A companion plugin that captures `console.error` and writes to a file the agent can poll
- **Electron IPC bridge**: Use Obsidian's Electron main process to forward console output

### Value
- Tighter feedback loop for plugin development
- Enables "capture → build → reload → verify" automation
- Could detect and auto-fix common errors like the BUG-010 getter-only property issue

### Risk
- Complexity of CDP connection to Obsidian's Electron process
- May require Obsidian to be started with `--remote-debugging-port`
- Security implications of exposing DevTools protocol

## Related
- [BUG-010](BUG-010-capture-proxy-getter-only-exports.md) — discovered during capture proxy work
- [DEBT-010](DEBT-010-capture-fixture-cycle.md) — capture-fixture workflow
