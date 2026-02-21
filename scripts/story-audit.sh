#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  scripts/story-audit.sh summary
  scripts/story-audit.sh candidates

Commands:
  summary     Print total and per-status counts from docs/stories.
  candidates  Print unfinished stories that look potentially completed already.
EOF
}

if [ ! -d "docs/stories" ]; then
  echo "story-audit: run from repo root (missing docs/stories)" >&2
  exit 1
fi

summary_cmd() {
  echo "Total stories: $(ls -1 docs/stories/*.md 2>/dev/null | wc -l | tr -d ' ')"
  echo "Unfinished stories: $(scripts/story-catalog.sh list | awk -F'|' 'NR>1 && $2!="Done" {c++} END {print c+0}')"
  echo ""
  echo "Status breakdown:"
  scripts/story-catalog.sh list \
    | awk -F'|' 'NR>1{count[$2]++} END{for(s in count) printf "%s|%d\n", s, count[s]}' \
    | sort \
    | while IFS='|' read -r status count; do
        printf "  %-11s %s\n" "${status}" "${count}"
      done
}

candidates_cmd() {
  node - <<'NODE'
const fs = require('fs');
const path = require('path');
const cp = require('child_process');

function sh(cmd) {
  try {
    return cp.execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
  } catch {
    return '';
  }
}

const files = fs.readdirSync('docs/stories').filter(f => f.endsWith('.md')).sort();
const rows = [];

for (const file of files) {
  const full = path.join('docs/stories', file);
  const text = fs.readFileSync(full, 'utf8');
  const keyMatch = file.match(/^([A-Z]+-\d+[a-z]?)-/);
  if (!keyMatch) continue;
  const key = keyMatch[1];

  const statusMatch = text.match(/^## Status\n([^\n]+)/m);
  const status = statusMatch ? statusMatch[1].trim() : 'Unknown';
  if (status === 'Done') continue;

  const checked = (text.match(/^- \[x\]/gim) || []).length;
  const unchecked = (text.match(/^- \[ \]/gim) || []).length;
  const testRefs = Number(sh(`rg -n --fixed-strings "${key}" tests 2>/dev/null | wc -l`) || 0);
  const title = (text.split('\n')[0] || '').replace(/^#\s*/, '').trim();

  let signal = 'none';
  if (checked > 0 && unchecked === 0) signal = 'high';
  else if (testRefs > 0) signal = 'medium';

  if (signal !== 'none') {
    rows.push({ key, status, checked, unchecked, testRefs, signal, full, title });
  }
}

rows.sort((a, b) =>
  (a.signal === b.signal ? 0 : (a.signal === 'high' ? -1 : 1)) ||
  (b.checked - a.checked) ||
  (b.testRefs - a.testRefs)
);

if (rows.length === 0) {
  console.log('No likely-completed candidates found among unfinished stories.');
  process.exit(0);
}

console.log('KEY|STATUS|CHECKED|UNCHECKED|TEST_REFS|SIGNAL|FILE');
for (const r of rows) {
  console.log([r.key, r.status, r.checked, r.unchecked, r.testRefs, r.signal, r.full].join('|'));
}
NODE
}

case "${1:-}" in
  summary) summary_cmd ;;
  candidates) candidates_cmd ;;
  -h|--help|help|"") usage ;;
  *)
    echo "story-audit: unknown command '${1:-}'" >&2
    usage >&2
    exit 2
    ;;
esac
