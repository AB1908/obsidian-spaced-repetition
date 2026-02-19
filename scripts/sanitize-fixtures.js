#!/usr/bin/env node
/* eslint-disable no-console */

const fs = require('fs');
const path = require('path');

const FIXTURES_DIR = path.join(process.cwd(), 'tests', 'fixtures');
const TARGET_RE = /^getFileContents_.*\.json$/;

const HEADING_POOL = [
  'Lorem Ipsum Heading',
  'Placeholder Section',
  'Synthetic Content Block',
  'Sample Navigation Marker',
  'Dummy Chapter Title',
];

const LINE_POOL = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
  'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.',
  'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.',
  'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
  'Curabitur blandit tempus porttitor, posuere nonummy inceptos.',
  'Integer posuere erat a ante venenatis dapibus posuere velit aliquet.',
  'Etiam porta sem malesuada magna mollis euismod.',
];

const NOTE_POOL = [
  'dummy-note-alpha',
  'dummy-note-bravo',
  'dummy-note-charlie',
  'dummy-note-delta',
  'dummy-note-echo',
];

function replaceQuotedScalar(value, replacement) {
  if (/^".*"$/.test(value)) {
    return `"${replacement}"`;
  }
  if (/^'.*'$/.test(value)) {
    return `'${replacement}'`;
  }
  return replacement;
}

function sanitizeFrontmatterLine(line, idx) {
  const m = line.match(/^(\s*)([A-Za-z0-9_-]+):(\s*)(.*)$/);
  if (!m) {
    return line;
  }

  const [, indent, key, spacing, rawValue] = m;
  const value = rawValue.trim();

  if (value === '' || /^-?\d+(\.\d+)?$/.test(value) || /^(true|false|null)$/i.test(value)) {
    return line;
  }

  if (key === 'tags' && /^".*"$/.test(value)) {
    return `${indent}${key}:${spacing}"review/dummy"`;
  }

  if (key === 'source') {
    return `${indent}${key}:${spacing}"https://example.invalid/dummy-source"`;
  }

  if (key === 'path') {
    return `${indent}${key}:${spacing}"Dummy/Placeholder-Source.mrexpt"`;
  }

  const replacement = `Dummy ${key} ${idx + 1}`;
  return `${indent}${key}:${spacing}${replaceQuotedScalar(value, replacement)}`;
}

function sanitizeBodyLine(line, state) {
  if (!line.trim()) return line;

  if (/^#/.test(line)) {
    const m = line.match(/^(#+\s*)(.*)$/);
    if (!m) return line;
    const text = `${HEADING_POOL[state.heading % HEADING_POOL.length]} ${state.heading + 1}`;
    state.heading += 1;
    return `${m[1]}${text}`;
  }

  if (/^>\s*\[![^\]]+\]\s+/.test(line)) {
    return line;
  }

  if (/^>\s*(\*\*\*|%%)$/.test(line.trim())) {
    return line;
  }

  if (/^>\s*(original_color|location|timestamp|origin):/.test(line)) {
    return line;
  }

  if (/^>\s*#+\s*$/.test(line)) {
    return line;
  }

  if (/^>\s*/.test(line)) {
    const prefix = line.match(/^>\s*/)[0];
    const body = LINE_POOL[state.quote % LINE_POOL.length];
    state.quote += 1;
    return `${prefix}${body}`;
  }

  if (/^<!--SR:/.test(line)) {
    return line;
  }

  if (/^\[\[[^\]]+\]\]$/.test(line.trim())) {
    const block = line.match(/\^([A-Za-z0-9_-]+)/);
    const suffix = block ? `#^${block[1]}` : '';
    const ref = `Dummy-Reference-${(state.ref % 9) + 1}`;
    state.ref += 1;
    return `[[${ref}${suffix}]]`;
  }

  if (/^[?-]\s*$/.test(line.trim())) {
    return line;
  }

  if (/\^[A-Za-z0-9_-]+\s*$/.test(line)) {
    return line.replace(/^(.*?)(\s*\^[A-Za-z0-9_-]+\s*)$/, (_m, text, blockId) => {
      const next = NOTE_POOL[state.note % NOTE_POOL.length];
      state.note += 1;
      return `${next}${blockId}`;
    });
  }

  const body = LINE_POOL[state.body % LINE_POOL.length];
  state.body += 1;
  return body;
}

function sanitizeMarkdown(markdown) {
  const lines = markdown.split('\n');
  const out = [];
  const state = { heading: 0, quote: 0, body: 0, note: 0, ref: 0 };

  let i = 0;
  if (lines[0] === '---') {
    out.push('---');
    i = 1;
    let fmLine = 0;
    for (; i < lines.length; i += 1) {
      const line = lines[i];
      if (line === '---') {
        out.push('---');
        i += 1;
        break;
      }

      if (/^\s*-\s*/.test(line)) {
        out.push(line.replace(/^\s*-\s*.*/, '  - "review/dummy"'));
      } else {
        out.push(sanitizeFrontmatterLine(line, fmLine));
      }
      fmLine += 1;
    }
  }

  for (; i < lines.length; i += 1) {
    out.push(sanitizeBodyLine(lines[i], state));
  }

  return out.join('\n');
}

function sanitizeFixtureFile(filePath) {
  const raw = fs.readFileSync(filePath, 'utf8');
  const fixture = JSON.parse(raw);

  if (!fixture || fixture.method !== 'getFileContents' || typeof fixture.output !== 'string') {
    return false;
  }

  const next = {
    ...fixture,
    output: sanitizeMarkdown(fixture.output),
  };

  fs.writeFileSync(filePath, `${JSON.stringify(next, null, 2)}\n`, 'utf8');
  return true;
}

function main() {
  if (!fs.existsSync(FIXTURES_DIR)) {
    console.error(`Missing fixtures directory: ${FIXTURES_DIR}`);
    process.exit(1);
  }

  const files = fs.readdirSync(FIXTURES_DIR)
    .filter((f) => TARGET_RE.test(f))
    .sort();

  let changed = 0;
  for (const file of files) {
    const filePath = path.join(FIXTURES_DIR, file);
    if (sanitizeFixtureFile(filePath)) {
      changed += 1;
    }
  }

  console.log(`[sanitize-fixtures] Sanitized ${changed} fixture files.`);
}

main();
