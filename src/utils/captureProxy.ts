import * as fs from 'fs';
import * as path from 'path';
// import * as originalApi from '../captureProxy';

const CAPTURE_MODE = true;
const FIXTURES_DIR = 'placeholder';

// Ensure fixtures directory exists
if (CAPTURE_MODE && !fs.existsSync(FIXTURES_DIR)) {
  console.log(FIXTURES_DIR)
  fs.mkdirSync(FIXTURES_DIR, { recursive: true });
}

/**
 * Generates a timestamp string safe for filenames
 */
function getTimestamp(): string {
    return new Date().toISOString().replace(/[:.]/g, '-');
}

/**
 * Captures function call data to a JSON file
 */
function captureToFile(methodName: string, input: any, output: any): void {
    if (!CAPTURE_MODE) return;

    try {
        const timestamp = getTimestamp();
        const random = Math.random().toString(36).substring(2, 8);
        const filename = `${methodName}_${timestamp}_${random}.json`;
        const filepath = path.join(FIXTURES_DIR, filename);

        const testCase = {
            method: methodName,
            capturedAt: new Date().toISOString(),
            input: input.length === 1 ? input[0] : input,
            output: output
        };

        fs.writeFileSync(filepath, JSON.stringify(testCase, null, 2), 'utf-8');
        console.log(`✓ Captured test case: ${filename}`);
    } catch (error) {
        // Don't let capture failures break the application
        console.error(`Failed to capture ${methodName}:`, error);
    }
}

/**
 * Creates a proxy that intercepts and captures all function calls
 */
function createCaptureProxy<T extends object>(target: T): T {
    if (!CAPTURE_MODE) {
        return target;
    }

    return new Proxy(target, {
        get(obj, prop: string | symbol) {
            // Only process string properties (method names)
            if (typeof prop !== 'string') {
                return obj[prop as keyof T];
            }

            const original = obj[prop as keyof T];

            // If not a function, return as-is
            if (typeof original !== 'function') {
                return original;
            }

            // Return wrapped function that captures calls
            return function (this: any, ...args: any[]) {
                try {
                    // Call original function with correct context
                    const result = original.apply(this, args);

                    // Handle async functions (Promises)
                    if (result instanceof Promise) {
                        return result
                            .then(resolved => {
                                captureToFile(prop, args, resolved);
                                return resolved;
                            })
                            .catch(error => {
                                // Optionally capture errors for debugging
                                console.error(`Error in ${prop}:`, error);
                                throw error;
                            });
                    }

                    // Handle sync functions
                    captureToFile(prop, args, result);
                    return result;
                } catch (error) {
                    console.error(`Error calling ${prop}:`, error);
                    throw error;
                }
            };
        }
    });
}

// Create and export the proxied API
export const api = createCaptureProxy(originalApi);

// Also export as default for flexibility
export default api;

// Re-export individual methods for convenience and type safety
// Adjust this list to match your actual api.ts exports
// export const {
//     // Add your other method names here...
//     writeCardToDisk, getTFileForPath, updateCardOnDisk, deleteCardOnDisk, fileTags, filePathsWithTag, getFileContents, getParentOrFilename, getMetadataForFile, getFolderNameFromPath, createFlashcardsFileForBook, getParentFolderPathAndName
// } = api;
