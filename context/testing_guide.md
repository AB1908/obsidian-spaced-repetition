# Testing Guide

## Mocks and Fixtures

The project uses a fixture-based mocking strategy for disk operations (`src/data/disk.ts`).

### `createDiskMockFromFixtures`
Located in `tests/helpers.ts`, this utility creates a mock object where functions are generated dynamically based on provided JSON fixture files.

**Important:** A function is ONLY mocked if at least one fixture file defines it via the `method` property.

### Adding a New Mocked Method
To mock a new method (e.g., `someNewDiskOp`):

1.  **Create a Fixture File:** Create a JSON file in `tests/fixtures/` (e.g., `someNewDiskOp.json`).
2.  **Define Method:** Set `"method": "someNewDiskOp"`.
3.  **Define Input/Output:**
    *   `input`: Array of arguments expected. For `deleteCardOnDisk(path, text)`, this should be a 2-element array.
    *   `output`: Return value.
    *   *Note:* If exact input matching is not required (e.g., for void functions where we just want the mock to exist and return `undefined`), you can provide placeholder inputs with the correct structure/arity. The mock will fallback to returning `Promise.resolve(undefined)` if the actual call doesn't match the fixture input, but the function *will* exist.
4.  **Register Fixture:** Add the filename to the `createDiskMockFromFixtures` call in your test file (e.g., `tests/api.test.ts`).

### Example: `deleteCardOnDisk`
To ensure `deleteCardOnDisk` is mocked:
1.  Create `tests/fixtures/deleteCardOnDisk.json`:
    ```json
    {
        "method": "deleteCardOnDisk",
        "input": ["path/to/file.md", "card text content"],
        "output": null
    }
    ```
    (Note: `output` is null because the function returns `Promise<void>`)
2.  Add `"deleteCardOnDisk.json"` to the fixture list in `tests/api.test.ts`.
