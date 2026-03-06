#!/usr/bin/env node
/**
 * gen-vault-fixtures.mjs
 *
 * Manages the relationship between tests/vault/ markdown files and
 * tests/fixtures/getFileContents_*.json fixtures.
 *
 * tests/vault/ is the canonical re-capture source: load these files into
 * Obsidian when re-capturing fixtures. Fixtures are NEVER synthesized from
 * vault files — they are always captured from real Obsidian.
 *
 * Modes:
 *   --bootstrap     One-time: extract vault .md files FROM existing getFileContents
 *                   fixtures. Prefers the latest capturedAt when multiple fixtures
 *                   map to the same vault path. Skips files that already exist.
 *
 *   --check         Verify vault files and getFileContents fixtures are in sync.
 *                   Compares vault file content against fixture output field.
 *                   Exits 1 if any drift detected. Fix: re-capture from Obsidian.
 *
 *   --stamp         Record current vault file hashes in .capture-session.
 *                   Run after a full Obsidian capture session to mark all fixture
 *                   types (not just getFileContents) as up-to-date.
 *
 *   --check-stamp   Verify vault files match the hashes in .capture-session.
 *                   Exits 1 if any vault file has changed since last stamp.
 *                   Warns (does not exit 1) if no .capture-session exists yet.
 *
 * Usage:
 *   node scripts/gen-vault-fixtures.mjs --bootstrap
 *   node scripts/gen-vault-fixtures.mjs --check
 *   node scripts/gen-vault-fixtures.mjs --stamp
 *   node scripts/gen-vault-fixtures.mjs --check-stamp
 *
 * Naming convention (matches captureProxy.ts inputSlug):
 *   "Atomic Habits/Annotations.md" -> getFileContents_Atomic-Habits_Annotations.json
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const VAULT_DIR = path.join(ROOT, 'tests', 'vault');
const FIXTURES_DIR = path.join(ROOT, 'tests', 'fixtures');

/**
 * Derive fixture filename slug from a vault-relative path.
 * Matches captureProxy.ts inputSlug convention.
 *
 * "Atomic Habits/Annotations.md"  →  "Atomic-Habits_Annotations"
 */
function pathToSlug(vaultPath) {
    return vaultPath
        .replace(/\.\w+$/, '')              // strip extension
        .replace(/[/\\]/g, '_')             // path separators → underscore
        .replace(/[^a-zA-Z0-9_-]/g, '-')   // other special chars → dash
        .replace(/-{2,}/g, '-')             // collapse consecutive dashes
        .replace(/^-|-$/g, '');             // trim leading/trailing dashes
}

/**
 * Recursively collect all .md files under dir, returning paths relative to dir.
 */
function collectMarkdownFiles(dir, prefix = '') {
    const results = [];
    for (const entry of fs.readdirSync(dir).sort()) {
        const fullPath = path.join(dir, entry);
        const relativePath = prefix ? `${prefix}/${entry}` : entry;
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            results.push(...collectMarkdownFiles(fullPath, relativePath));
        } else if (entry.endsWith('.md')) {
            results.push(relativePath);
        }
    }
    return results;
}

/**
 * Bootstrap: extract vault .md files from existing getFileContents fixtures.
 * One-time operation to populate tests/vault/ from captured fixtures.
 *
 * Deduplication: when multiple fixtures share the same vault path, prefer
 * the one with the latest capturedAt (e.g. 2026-02-17 semantic capture wins
 * over 2025-12-07 timestamp capture for "Untitled.md").
 *
 * Skips vault files that already exist.
 */
function bootstrap() {
    if (!fs.existsSync(FIXTURES_DIR)) {
        console.error(`fixtures directory not found: ${FIXTURES_DIR}`);
        process.exit(1);
    }

    const fixtureFiles = fs.readdirSync(FIXTURES_DIR)
        .filter(f => f.startsWith('getFileContents_') && f.endsWith('.json'))
        .sort();

    // Group by vault path, keeping only the latest capturedAt for each path.
    const latestByPath = new Map();

    for (const fixtureName of fixtureFiles) {
        let fixture;
        try {
            fixture = JSON.parse(fs.readFileSync(path.join(FIXTURES_DIR, fixtureName), 'utf-8'));
        } catch (e) {
            console.warn(`  skip (parse error): ${fixtureName}: ${e.message}`);
            continue;
        }

        const input = fixture.input;
        if (typeof input !== 'string' || !input.endsWith('.md')) {
            console.log(`  skip (non-.md input): ${fixtureName}`);
            continue;
        }
        if (typeof fixture.output !== 'string') {
            console.log(`  skip (non-string output): ${fixtureName}`);
            continue;
        }

        const thisTime = fixture.capturedAt ? new Date(fixture.capturedAt).getTime() : 0;
        const prev = latestByPath.get(input);
        const prevTime = prev ? (prev.capturedAt ? new Date(prev.capturedAt).getTime() : 0) : -1;

        if (!prev || thisTime > prevTime) {
            latestByPath.set(input, fixture);
        }
    }

    let written = 0;
    let skipped = 0;

    for (const [vaultRelPath, fixture] of latestByPath) {
        const vaultPath = path.join(VAULT_DIR, vaultRelPath);

        if (fs.existsSync(vaultPath)) {
            console.log(`  exists (skip): ${vaultRelPath}`);
            skipped++;
            continue;
        }

        fs.mkdirSync(path.dirname(vaultPath), { recursive: true });
        fs.writeFileSync(vaultPath, fixture.output);
        console.log(`  wrote ${vaultRelPath}`);
        written++;
    }

    console.log(`\nbootstrap complete: ${written} written, ${skipped} skipped`);
    if (written > 0) {
        console.log('Next: node scripts/gen-vault-fixtures.mjs --check');
    }
}

/**
 * Check: verify vault .md files and getFileContents fixtures are in sync.
 * For each vault file, finds the corresponding fixture and compares content.
 * Exits 1 if any vault file lacks a fixture or has drifted from it.
 *
 * Fix for any failure: re-capture from Obsidian (not manual editing).
 */
function check() {
    if (!fs.existsSync(VAULT_DIR)) {
        console.error(`vault directory not found: ${VAULT_DIR}`);
        process.exit(1);
    }

    const vaultFiles = collectMarkdownFiles(VAULT_DIR);
    if (vaultFiles.length === 0) {
        console.error('no .md files found in tests/vault/');
        process.exit(1);
    }

    let failures = 0;

    for (const vaultPath of vaultFiles) {
        const fullVaultPath = path.join(VAULT_DIR, vaultPath);
        const vaultContent = fs.readFileSync(fullVaultPath, 'utf-8');

        // Skip meta files (no frontmatter). Real vault source files always start with '---'.
        if (!vaultContent.startsWith('---')) {
            console.log(`  skip (no frontmatter): ${vaultPath}`);
            continue;
        }

        const slug = pathToSlug(vaultPath);
        const fixtureName = `getFileContents_${slug}.json`;
        const fixturePath = path.join(FIXTURES_DIR, fixtureName);

        if (!fs.existsSync(fixturePath)) {
            console.error(`✗ MISSING fixture: ${fixtureName}`);
            console.error(`  vault file exists but no corresponding getFileContents fixture`);
            console.error(`  fix: load tests/vault/ into Obsidian and re-capture`);
            failures++;
            continue;
        }

        let fixture;
        try {
            fixture = JSON.parse(fs.readFileSync(fixturePath, 'utf-8'));
        } catch (e) {
            console.error(`✗ PARSE ERROR: ${fixtureName}: ${e.message}`);
            failures++;
            continue;
        }

        if (fixture.output !== vaultContent) {
            console.error(`✗ DRIFT: ${vaultPath}`);
            console.error(`  vault content differs from ${fixtureName} output`);
            console.error(`  fix: load tests/vault/ into Obsidian and re-capture`);
            failures++;
        } else {
            console.log(`✓ ${fixtureName}`);
        }
    }

    if (failures > 0) {
        console.error(`\n${failures} check(s) failed.`);
        console.error('Re-capture all fixtures from Obsidian using tests/vault/ as source.');
        process.exit(1);
    } else {
        console.log(`\n✓ all ${vaultFiles.length} vault file(s) in sync with fixtures`);
    }
}

const SESSION_FILE = path.join(VAULT_DIR, '.capture-session');

/**
 * Stamp: record a SHA-256 hash of every vault .md file in .capture-session.
 * Run after a full Obsidian capture session to mark all fixture types as current.
 */
function stamp() {
    const vaultFiles = collectMarkdownFiles(VAULT_DIR);
    const vaultHashes = {};
    for (const vaultPath of vaultFiles) {
        const content = fs.readFileSync(path.join(VAULT_DIR, vaultPath), 'utf-8');
        if (!content.startsWith('---')) continue; // skip meta files
        vaultHashes[vaultPath] = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
    }
    const session = { stampedAt: new Date().toISOString(), vaultFiles: vaultHashes };
    fs.writeFileSync(SESSION_FILE, JSON.stringify(session, null, 2) + '\n');
    console.log(`✓ Stamped ${vaultFiles.length} vault file(s) at ${session.stampedAt}`);
}

/**
 * Check-stamp: verify vault files match the hashes in .capture-session.
 * Exits 1 if any vault file has changed since the last stamp.
 * Warns (does not exit 1) if no .capture-session exists — first-time setup path.
 */
function checkStamp() {
    if (!fs.existsSync(SESSION_FILE)) {
        console.warn('⚠  No .capture-session found.');
        console.warn('   After a full Obsidian capture, run: npm run vault:stamp');
        return;
    }
    const session = JSON.parse(fs.readFileSync(SESSION_FILE, 'utf-8'));
    const vaultFiles = collectMarkdownFiles(VAULT_DIR);
    let failures = 0;
    for (const vaultPath of vaultFiles) {
        const content = fs.readFileSync(path.join(VAULT_DIR, vaultPath), 'utf-8');
        const actual = crypto.createHash('sha256').update(content).digest('hex').slice(0, 16);
        const stamped = session.vaultFiles[vaultPath];
        if (!stamped) {
            console.error(`✗ UNSTAMPED: ${vaultPath} — not in .capture-session`);
            failures++;
        } else if (actual !== stamped) {
            console.error(`✗ STALE STAMP: ${vaultPath} — changed since last capture session`);
            failures++;
        }
    }
    if (failures > 0) {
        console.error(`\n${failures} file(s) changed since last stamp.`);
        console.error('Re-capture ALL fixture types from Obsidian, then run: npm run vault:stamp');
        process.exit(1);
    }
    console.log(`✓ Vault stamp is current (${vaultFiles.length} files, stamped ${session.stampedAt})`);
}

// Main
const args = process.argv.slice(2);
if (args.includes('--bootstrap')) {
    bootstrap();
} else if (args.includes('--check')) {
    check();
} else if (args.includes('--stamp')) {
    stamp();
} else if (args.includes('--check-stamp')) {
    checkStamp();
} else {
    console.error('Usage:');
    console.error('  node scripts/gen-vault-fixtures.mjs --bootstrap     # extract vault files from fixtures');
    console.error('  node scripts/gen-vault-fixtures.mjs --check         # verify vault/fixture sync');
    console.error('  node scripts/gen-vault-fixtures.mjs --stamp         # record vault state after Obsidian capture');
    console.error('  node scripts/gen-vault-fixtures.mjs --check-stamp   # verify vault matches last stamp');
    process.exit(1);
}
