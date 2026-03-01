# META-020: Contract Verification Quiet Mode

## Status
Proposed

## Epic
None

## Description

`scripts/verify-test-contract.sh` prints a `[contract][OK]` line for every
passing check. For contracts with many `TEST_FILE`, `TEST_NAME`, and `TEST_CMD`
entries this produces substantial noise in CI output and delegation logs, making
it harder to spot actual failures.

### Current behaviour

Each passing check emits its own line, e.g.:

```
[contract][OK] test file exists: tests/helpers.ts
[contract][OK] test name found: returns all annotations
[contract][OK] command passed: npm test -- annotation
```

With a large contract this can produce a dozen or more `[contract][OK]` lines
before the final `[contract] verification passed` summary.

### Proposed behaviour

On success, collapse all per-check OK lines into a single summary:

```
✓ 3/3 contract checks passed
```

On any failure, print the full per-check output (OK and FAIL lines) so the
developer can see which checks passed before the failure.

This keeps the happy path concise while preserving diagnostic detail when it
matters.

## Acceptance Criteria

- [ ] On a fully-passing contract run, stdout contains exactly one summary line
      of the form `✓ N/N contract checks passed` and no individual `[contract][OK]` lines.
- [ ] On a failing contract run, all per-check lines (OK and FAIL) are printed,
      followed by `[contract] verification failed`.
- [ ] Existing behaviour of `[contract][SKIP]` and `[contract][RUN]` lines is
      unchanged.
- [ ] `npm test` passes (no test coverage for this script, but no regressions).

## Likely Touchpoints

`scripts/verify-test-contract.sh` — the three locations that emit `[contract][OK]`:

| Line | Current output |
|------|----------------|
| 74   | `echo "[contract][OK] test file exists: $f"` |
| 80   | `echo "[contract][OK] test name found: $name"` |
| 94   | `echo "[contract][OK] command passed: $cmd"` |

The fix collects a pass-count and total-count as checks run, then on success
prints the summary instead of the buffered OK lines. On failure it flushes the
buffered output before printing the `[contract][FAIL]` lines.

## Related

- [META-003](META-003-delegated-test-contract-enforcement.md)
- [META-004](META-004-delegation-observability-and-guardrails.md)
