#!/usr/bin/env bash
set -euo pipefail

# Keep docs lint deterministic and script-first.
# Story taxonomy/keys are validated by the catalog checker.
scripts/story-catalog.sh check
