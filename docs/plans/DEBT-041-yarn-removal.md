# Plan: DEBT-041 — Remove Yarn Drift, Standardize npm

## Goal

Make npm the sole package manager. Two scripts still call `yarn`; `yarn.lock` is still
tracked. Fix both. No dependency version changes — lockfile stays representative of
current installed state.

---

## Confirmed State (verified against live codebase)

```
package.json:9    "format": "yarn prettier --write .",
package.json:10   "lint": "yarn prettier --check .",
yarn.lock         tracked in repo root
package-lock.json tracked in repo root (used by all CI)
```

CI workflows (`pr.yml`, `release.yml`, `codeql-analysis.yml`) all use `npm ci` — no
Yarn in CI. Only the two local dev scripts are stale.

---

## Changes

### 1. `package.json` — fix two scripts

```json
// before
"format": "yarn prettier --write .",
"lint": "yarn prettier --check .",

// after
"format": "prettier --write .",
"lint": "prettier --check .",
```

`prettier` is already in `devDependencies` and resolvable via `npx`/local bin through
npm scripts. No install needed.

### 2. Remove `yarn.lock`

```bash
git rm yarn.lock
```

No lockfile regeneration needed — `package-lock.json` is already current (used by CI).

---

## Out of Scope

- CI workflow changes — already npm-only
- Dependency version upgrades
- Documentation updates (no active onboarding docs instruct yarn commands)

---

## Verification

Run: `npm run lint` — must exit 0.
Run: `npm run format -- --check` (or `npm run lint`) — must exit 0.
Run: `npm test` — all suites must pass.
Run: `npm run build` — must compile clean.
Run: `bash -c '! grep -rn "\"yarn" package.json'` — no yarn invocations in scripts.
