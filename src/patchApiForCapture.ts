import * as fs from 'fs';
import * as path from 'path';

const CAPTURE_MODE = 'true';
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
    console.error(`Failed to capture ${methodName}:`, error);
  }
}

/**
 * Patches all functions in a module to capture their calls
 * This modifies the module object in-place
 */
export function patchModuleForCapture(moduleExports: any, moduleName: string = 'api'): void {
  if (!CAPTURE_MODE) {
    console.log('⚠ Capture mode disabled');
    return;
  }

  console.log(`🔧 Patching ${moduleName} for test data capture...`);

  // Get all exported function names
  const functionNames = Object.keys(moduleExports).filter(
    key => typeof moduleExports[key] === 'function'
  );

  // Wrap each function
  functionNames.forEach(methodName => {
    const originalFunction = moduleExports[methodName];

    // Replace the function with wrapped version
    moduleExports[methodName] = function(this: any, ...args: any[]) {
      try {
        // Call original with correct context
        const result = originalFunction.apply(this, args);

        // Handle async functions
        if (result instanceof Promise) {
          return result
            .then(resolved => {
              captureToFile(methodName, args, resolved);
              return resolved;
            })
            .catch(error => {
              console.error(`Error in ${methodName}:`, error);
              throw error;
            });
        }

        // Handle sync functions
        captureToFile(methodName, args, result);
        return result;
      } catch (error) {
        console.error(`Error calling ${methodName}:`, error);
        throw error;
      }
    };

    // Preserve function name for debugging
    Object.defineProperty(moduleExports[methodName], 'name', {
      value: originalFunction.name,
      writable: false
    });
  });

  console.log(`✓ Patched ${functionNames.length} functions: ${functionNames.join(', ')}`);
}