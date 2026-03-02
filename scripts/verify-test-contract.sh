#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/verify-test-contract.sh <contract-file> [--repo-root <path>] [--run-required-commands]

Contract format markers in markdown:
  TEST_FILE: <path>
  TEST_NAME: <exact test title substring>
  TEST_CMD: <shell command>
EOF
}

if [ "${1:-}" = "-h" ] || [ "${1:-}" = "--help" ] || [ "${1:-}" = "help" ] || [ -z "${1:-}" ]; then
  usage
  exit 0
fi

CONTRACT_FILE="$1"
shift || true

REPO_ROOT="."
RUN_CMDS=0

while [ "$#" -gt 0 ]; do
  case "$1" in
    --repo-root)
      shift
      REPO_ROOT="${1:-}"
      ;;
    --run-required-commands)
      RUN_CMDS=1
      ;;
    *)
      echo "verify-test-contract: unknown argument: $1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

if [ ! -f "$CONTRACT_FILE" ]; then
  echo "verify-test-contract: contract file not found: $CONTRACT_FILE" >&2
  exit 1
fi

if [ ! -d "$REPO_ROOT" ]; then
  echo "verify-test-contract: repo root not found: $REPO_ROOT" >&2
  exit 1
fi

mapfile -t TEST_FILES < <(sed -n 's/^TEST_FILE:[[:space:]]*//p' "$CONTRACT_FILE")
mapfile -t TEST_NAMES < <(sed -n 's/^TEST_NAME:[[:space:]]*//p' "$CONTRACT_FILE")
mapfile -t TEST_CMDS < <(sed -n 's/^TEST_CMD:[[:space:]]*//p' "$CONTRACT_FILE")

if [ "${#TEST_FILES[@]}" -eq 0 ] && [ "${#TEST_NAMES[@]}" -eq 0 ] && [ "${#TEST_CMDS[@]}" -eq 0 ]; then
  echo "verify-test-contract: no TEST_FILE/TEST_NAME/TEST_CMD markers found in $CONTRACT_FILE" >&2
  exit 1
fi

fail=0
pass_count=0
total_count=0
ok_buffer=()

echo "[contract] file: $CONTRACT_FILE"
echo "[contract] repo-root: $REPO_ROOT"

for f in "${TEST_FILES[@]}"; do
  ((total_count++)) || true
  if [ ! -f "$REPO_ROOT/$f" ]; then
    echo "[contract][FAIL] missing test file: $f" >&2
    fail=1
  else
    ok_buffer+=("[contract][OK] test file exists: $f")
    ((pass_count++)) || true
  fi
done

for name in "${TEST_NAMES[@]}"; do
  ((total_count++)) || true
  if rg -n --fixed-strings --glob '*.test.ts' --glob '*.test.tsx' "$name" "$REPO_ROOT/tests" >/dev/null 2>&1; then
    ok_buffer+=("[contract][OK] test name found: $name")
    ((pass_count++)) || true
  else
    echo "[contract][FAIL] test name not found: $name" >&2
    fail=1
  fi
done

if [ "$RUN_CMDS" -eq 1 ]; then
  for cmd in "${TEST_CMDS[@]}"; do
    ((total_count++)) || true
    echo "[contract][RUN] $cmd"
    if ! (cd "$REPO_ROOT" && bash -lc "$cmd"); then
      echo "[contract][FAIL] command failed: $cmd" >&2
      fail=1
    else
      ok_buffer+=("[contract][OK] command passed: $cmd")
      ((pass_count++)) || true
    fi
  done
else
  for cmd in "${TEST_CMDS[@]}"; do
    echo "[contract][SKIP] required command not executed: $cmd"
  done
fi

if [ "$fail" -ne 0 ]; then
  [ "${#ok_buffer[@]}" -gt 0 ] && printf '%s\n' "${ok_buffer[@]}"
  echo "[contract] verification failed" >&2
  exit 1
fi

echo "✓ ${pass_count}/${total_count} contract checks passed"

