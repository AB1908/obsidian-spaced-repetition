# Git Workflow Guide

This document outlines the preferred Git workflow for this project, based on user guidance.

## Commits

### 1. Single Responsibility
Each commit should address a single, atomic concern. If a commit message contains the word "and", it's a sign that it might be doing too much and should be split into multiple commits.

**Example:**
- **BAD:** `test: fix test and add docs`
- **GOOD:** Commit 1: `test: fix flaky getCurrentCard test`. Commit 2: `docs(context): explain test flakiness source`.

### 2. Conventional Commits
Use the [Conventional Commits](https://www.conventionalcommits.org/) specification. Common types used in this project include:
- `test:` for adding or fixing tests.
- `docs:` for documentation changes.
- `feat:` for new features.
- `fix:` for bug fixes.

### 3. Custom `context` Scope
For documentation that is specifically for developer or AI agent context (i.e., files within the `context/` directory), use the `docs(context):` format.

**Example:**
- `docs(context): add guide for git workflow`

## Pushing Changes

A strict, multi-step approval process is required before pushing changes.

1.  **Stage:** Run `git add`. Ask for user approval.
2.  **Commit:** Run `git commit`. Ask for user approval.
3.  **Push:** Run `git push`. Ask for user approval.

Do not assume approval for a later step is implied by approval for an earlier one. If a commit needs to be amended, explain why and ask for approval for the `git commit --amend` and subsequent `git push --force-with-lease` calls.
