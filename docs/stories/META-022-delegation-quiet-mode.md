# META-022: Delegation Quiet Mode — Suppress Per-Turn Codex Transcript

## Status
Proposed

## Epic
None

## Description

When `delegate-codex-task.sh` runs with `--execute`, the Codex transcript is
captured via `script -qefc` into a `--log-file` and simultaneously streamed to
stdout. Claude's Bash tool captures everything on stdout and passes it through
the context window. Codex transcripts routinely reach 800 KB or more for
non-trivial tasks. This burns a substantial portion of the token budget before
the parent session can inspect results, and makes it harder to reason about
what actually happened at a glance.

### Current Behavior

Without `--log-file`, stdout of the `codex exec` subprocess is captured
directly into the Bash tool result:

```bash
if ! "${CODEX_CMD[@]}"; then
  run_status="failed"
fi
```

With `--log-file`, the `script` utility is used as a PTY wrapper:

```bash
CODEX_SHELL_CMD="$(printf '%q ' "${CODEX_CMD[@]}")"
if ! script -qefc "$CODEX_SHELL_CMD" "$LOG_FILE"; then
  run_status="failed"
fi
```

In both cases, every per-turn Codex line (tool calls, intermediate reasoning,
model output) is echoed to stdout and captured in Claude's context. For a
moderately complex task this can amount to thousands of lines of transcript
before the final summary block.

### The Final Summary Block

Codex's final output follows a predictable structure. The delegation prompt
instructs:

> "Final output must include: changed files, tests run, and any deviations
> from scope."

In practice the final summary block appears near the end of the transcript and
contains lines matching one or more of:

- `Changed files` (or `Files changed`, `Changed:`, file diff sections)
- `Tests run` (or `Tests passed`, `Test results`, `Running tests`)
- `Deviations from scope` (or `Deviations:`, `Deviation:`, `No deviations`)

A reliable heuristic: extract the last N lines of the raw log where N is large
enough to capture the trailing summary section (typically 60-150 lines). The
final summary is always at the tail of the transcript, not embedded mid-run.

An extraction pattern using `awk` or `grep`:

```bash
# Find the line containing "Changed files" or "Deviations from scope"
# and extract from that point to end of file
summary_start=$(grep -n -m1 \
  -E "^(Changed files|Files changed|Deviations|Tests run|Tests passed)" \
  "$LOG_FILE" | tail -1 | cut -d: -f1)
if [ -n "$summary_start" ]; then
  tail -n "+${summary_start}" "$LOG_FILE"
else
  tail -60 "$LOG_FILE"
fi
```

The semantic log produced by `semantic-exec-log.sh` already captures changed
files and contract results by inspecting the worktree directly (via
`git diff --name-status`). What is missing is the human-readable Codex
summary and any deviations Codex itself noted.

### Proposed: `--quiet` Flag

Add a `--quiet` flag to `delegate-codex-task.sh`. When set:

1. Codex stdout is fully suppressed during the run (redirected to the log file
   only — no tee to stdout).
2. After the run completes, the script extracts and prints only:
   - The final summary block from the raw log (using the heuristic above).
   - The contract verification result lines (from
     `scripts/verify-test-contract.sh`).
   - The semantic log path written by `semantic-exec-log.sh`.
3. Exit code behavior is unchanged: non-zero on failure.

This keeps the parent Claude session's context window focused on structured
outcome signals rather than raw Codex per-turn chatter.

### Exact Changes Needed in the Script

**1. New flag declaration** (in the argument parsing block, after `EXECUTE=0`):

```bash
QUIET=0
```

**2. New `--quiet` case** (in the `while [ $# -gt 0 ]` argument-parsing loop):

```bash
--quiet)
  QUIET=1
  ;;
```

**3. Updated usage string** (in the `usage()` function, Options section):

```
  --quiet                   Suppress per-turn Codex transcript; print only
                            final summary block + contract results + semantic
                            log path after run completes.
```

**4. New helper function** (before the `if [ "$EXECUTE" -eq 1 ]` block):

```bash
extract_codex_summary() {
  local log="$1"
  [ -f "$log" ] || return
  local start
  start=$(grep -n -m1 \
    -E "^(Changed files|Files changed|Deviations from scope|Deviations:|Tests run|Tests passed)" \
    "$log" 2>/dev/null | tail -1 | cut -d: -f1)
  if [ -n "$start" ]; then
    tail -n "+${start}" "$log"
  else
    tail -60 "$log"
  fi
}
```

**5. Updated Codex execution block** (the `if [ -n "$LOG_FILE" ]` branch inside
`if [ "$EXECUTE" -eq 1 ]`):

Replace the current:

```bash
if [ -n "$LOG_FILE" ]; then
  mkdir -p "$(dirname "$LOG_FILE")"
  if command -v script >/dev/null 2>&1; then
    CODEX_SHELL_CMD="$(printf '%q ' "${CODEX_CMD[@]}")"
    if ! script -qefc "$CODEX_SHELL_CMD" "$LOG_FILE"; then
      run_status="failed"
    fi
  else
    if ! "${CODEX_CMD[@]}" 2>&1 | tee "$LOG_FILE"; then
      run_status="failed"
    fi
  fi
else
  if ! "${CODEX_CMD[@]}"; then
    run_status="failed"
  fi
fi
```

With:

```bash
if [ -n "$LOG_FILE" ]; then
  mkdir -p "$(dirname "$LOG_FILE")"
  if command -v script >/dev/null 2>&1; then
    CODEX_SHELL_CMD="$(printf '%q ' "${CODEX_CMD[@]}")"
    if [ "$QUIET" -eq 1 ]; then
      # Suppress per-turn output; only log file receives transcript.
      if ! script -qefc "$CODEX_SHELL_CMD" "$LOG_FILE" > /dev/null 2>&1; then
        run_status="failed"
      fi
    else
      if ! script -qefc "$CODEX_SHELL_CMD" "$LOG_FILE"; then
        run_status="failed"
      fi
    fi
  else
    if [ "$QUIET" -eq 1 ]; then
      if ! "${CODEX_CMD[@]}" > "$LOG_FILE" 2>&1; then
        run_status="failed"
      fi
    else
      if ! "${CODEX_CMD[@]}" 2>&1 | tee "$LOG_FILE"; then
        run_status="failed"
      fi
    fi
  fi
else
  if [ "$QUIET" -eq 1 ]; then
    echo "[delegate] --quiet requires --log-file to capture transcript." >&2
    exit 1
  fi
  if ! "${CODEX_CMD[@]}"; then
    run_status="failed"
  fi
fi
```

**6. New quiet-output block** (after `semantic-exec-log.sh` invocation, before the
`if [ "$run_status" = "failed" ]` check):

```bash
if [ "$QUIET" -eq 1 ] && [ -n "$LOG_FILE" ]; then
  echo ""
  echo "[delegate] === CODEX FINAL SUMMARY ==="
  extract_codex_summary "$LOG_FILE"
  echo ""
  echo "[delegate] === CONTRACT RESULT: $contract_status ==="
  echo "[delegate] === SEMANTIC LOG: $SEMANTIC_LOG ==="
fi
```

### Constraint: `--quiet` Requires `--log-file`

Without `--log-file`, the transcript has nowhere to go when suppressed. The
script must exit with an error if `--quiet` is passed without `--log-file`.
This is enforced in the updated execution block above.

### Example Invocation

```bash
scripts/delegate-codex-task.sh \
  --branch story-030-some-feature \
  --scope-file docs/plans/STORY-030-some-feature.md \
  --test-contract docs/plans/STORY-030-some-feature-test-contract.md \
  --log-file docs/executions/logs/story-030-some-feature.log \
  --semantic-log docs/executions/semantic/story-030-some-feature.md \
  --base main \
  --quiet \
  --execute
```

## Acceptance Criteria

- [ ] `--quiet` flag added to `delegate-codex-task.sh`
- [ ] When `--quiet` is set, no per-turn Codex output appears on stdout
- [ ] After run, script prints: final summary block extracted from log, contract
      result label, semantic log path
- [ ] `--quiet` without `--log-file` exits with an error and clear message
- [ ] `--dry-run` mode documents the quiet flag in its output
- [ ] Existing behavior (no `--quiet`) is unchanged
- [ ] Updated `usage()` string documents the new flag

## Likely Touchpoints

- `scripts/delegate-codex-task.sh`

## Related

- [META-004](META-004-delegation-observability-and-guardrails.md) — delegation observability
- [META-003](META-003-delegated-test-contract-enforcement.md) — contract enforcement
