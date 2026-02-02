# Fixture Organization Plan

## Current State
*   **Structure:** Flat directory `tests/fixtures/`.
*   **Naming Convention:** Mixed, but predominantly `methodName_timestamp_id.json`.
*   **Issues:**
    *   **Clutter:** Flat structure becomes unmanageable as the number of test cases grows.
    *   **Opaque Filenames:** Random IDs and timestamps (`_bcx627`) provide no context about the scenario being tested (e.g., "valid file" vs "missing metadata").
    *   **Discoverability:** Hard to visualize test coverage for a specific method at a glance.

## Proposed Improvements

### 1. Hierarchical Structure (Directory per Method)
Organize fixtures into subdirectories corresponding to the method they mock.

**Example:**
```text
tests/fixtures/
  ├── getFileContents/
  │   ├── valid_markdown_note.json
  │   ├── empty_file.json
  │   └── note_with_frontmatter.json
  ├── updateCardOnDisk/
  │   ├── basic_update_success.json
  │   └── concurrent_edit_conflict.json
  └── deleteCardOnDisk/
      └── success_delete.json
```

### 2. Semantic Filenames
Replace timestamp/ID suffixes with human-readable descriptions of the test scenario.
*   **Bad:** `getFileContents_2025-12-07T19..._bcx627.json`
*   **Good:** `getFileContents/note_with_tags.json`

### 3. Updates to Test Helpers
Modify `tests/helpers.ts` (`createDiskMockFromFixtures`) to support this structure:
*   Allow passing directory paths or simplified names (e.g., `"getFileContents/*"` to load all scenarios).
*   Recursively search `tests/fixtures` or look into specific subfolders.

### 4. Metadata/Index (Optional)
Consider a `manifest.json` in each folder if scenarios require complex setup descriptions not fit for filenames, or to tag fixtures for specific test suites.

## Benefits
*   **Human & LLM Readability:** Easier to understand *what* is being tested without opening every file.
*   **Scalability:** Cleanly supports hundreds of fixtures.
*   **Maintenance:** Easier to find and update relevant mocks when changing a method's logic.
