// test-utils/disk-mock-helper.ts
import * as fs from 'fs';
import * as path from 'path';
import { fixtureTransformer } from './fixture-transformer';
import { nanoidMock } from './nanoid-mock';

interface FixtureFile {
    method: string;
    capturedAt?: string;
    input: any;
    output: any;
}

export function createDiskMockFromFixtures(
    fixtureFiles: string[],
    options: {
        transformIds?: boolean;
        debug?: boolean;
    } = {}
) {
    const { transformIds = true, debug = false } = options;

    const mockImplementations: Record<string, jest.Mock> = {};
    const fixtureData: Record<string, FixtureFile[]> = {};
    const fixturesDir = path.join(process.cwd(), 'tests', 'fixtures');

    if (debug) {
        console.log(`[HELPER DEBUG] Fixtures directory: ${fixturesDir}`);
        console.log(`[HELPER DEBUG] ID transformation: ${transformIds ? 'ENABLED' : 'DISABLED'}`);
    }

    // 1. Load and transform fixtures
    for (const filename of fixtureFiles) {
        const fixturePath = path.join(fixturesDir, filename);

        if (!fs.existsSync(fixturePath)) {
            console.warn(`[HELPER DEBUG] Fixture file not found: ${fixturePath}`);
            continue;
        }

        const rawFixture: FixtureFile = JSON.parse(fs.readFileSync(fixturePath, "utf8"));

        const fixture: FixtureFile = transformIds ? {
            method: rawFixture.method,
            capturedAt: rawFixture.capturedAt,
            input: fixtureTransformer.transform(rawFixture.input),
            output: fixtureTransformer.transform(rawFixture.output),
        } : rawFixture;

        if (filename.includes("fileTags") && Array.isArray(fixture.output)) {
            fixture.output = new Map(fixture.output);
        }

        if (debug) {
            console.log(`[HELPER DEBUG] Loaded fixture from ${filename}`);
        }

        const { method } = fixture;
        if (!method) {
            console.warn(`[HELPER DEBUG] Fixture file is missing 'method' property: ${filename}`);
            continue;
        }

        if (!fixtureData[method]) {
            fixtureData[method] = [];
        }
        fixtureData[method].push(fixture);
    }

    if (debug) {
        console.log('[HELPER DEBUG] ID mappings:');
        for (const [original, transformed] of fixtureTransformer.getIdMappings().entries()) {
            console.log(`  ${original} -> ${transformed}`);
        }
    }

    // 2. Create mock functions
    for (const method in fixtureData) {
        mockImplementations[method] = jest.fn((...args: any[]) => {
            let actualInput: any;
            if (args.length === 0) {
                actualInput = [];
            } else if (args.length === 1) {
                actualInput = args[0];
            } else {
                actualInput = args;
            }

            const transformedInput = transformIds
                ? fixtureTransformer.transform(actualInput)
                : actualInput;

            if (debug) {
                console.log(`\n[HELPER DEBUG] Mocked function '${method}' called`);
                console.log(`[HELPER DEBUG] Normalized input:`, actualInput);
                if (transformIds) {
                    console.log(`[HELPER DEBUG] Transformed input:`, transformedInput);
                }
            }

            const fixturesForMethod = fixtureData[method];

            const match = fixturesForMethod.find(f => {
                return JSON.stringify(f.input) === JSON.stringify(transformedInput);
            });

            if (match) {
                if (debug) {
                    console.log('[HELPER DEBUG] ✓ Match found! Returning fixture output');
                }
                return match.output;
            }

            console.warn(`[HELPER DEBUG] ✗ No fixture found for ${method} with input:`, transformedInput);
            return Promise.resolve(undefined);
        });
    }

    return mockImplementations;
}

export function resetFixtureTransformer(): void {
    fixtureTransformer.reset();
}

export function getMappedId(originalId: string): string | undefined {
    return fixtureTransformer.getMappedId(originalId);
}

export function getIdMappings(): Map<string, string> {
    return fixtureTransformer.getIdMappings();
}