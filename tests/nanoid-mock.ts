// /*
//  * Module mock inspired by https://stackoverflow.com/a/54948644
//  */
// let value = 0;

// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export function nanoid(size?: number): string {
//     const retval = value.toString();
//     value++;
//     return retval;
// }

// test-utils/nanoid-mock.ts
import { createHash } from 'crypto';

/**
 * Mock for nanoid that generates deterministic IDs based on a counter or seed.
 * Can also map specific original IDs to their deterministic equivalents.
 */
class NanoidMock {
    private counter = 0;
    private idRegistry = new Map<string, string>();
    private mode: 'counter' | 'hash' = 'counter';

    /**
     * Reset the mock state between tests
     */
    reset(): void {
        this.counter = 0;
        this.idRegistry.clear();
    }

    /**
     * Set the ID generation mode
     * - 'counter': Generate sequential IDs (test_000001, test_000002, ...)
     * - 'hash': Generate hash-based IDs (more realistic but still deterministic)
     */
    setMode(mode: 'counter' | 'hash'): void {
        this.mode = mode;
    }

    /**
     * Generate a deterministic ID
     */
    generate(length: number = 8): string {
        if (this.mode === 'counter') {
            return this.generateCounterBased(length);
        } else {
            return this.generateHashBased(length);
        }
    }

    /**
     * Generate counter-based ID (easier to debug)
     */
    private generateCounterBased(length: number): string {
        const id = `t${String(this.counter).padStart(length - 1, '0')}`;
        this.counter++;
        return id;
    }

    /**
     * Generate hash-based ID (looks more realistic)
     */
    private generateHashBased(length: number): string {
        const seed = `nanoid_${this.counter}`;
        this.counter++;

        const hash = createHash('sha256')
            .update(seed)
            .digest('base64url')
            .slice(0, length);

        return hash;
    }

    /**
     * Register a mapping from an original production ID to a test ID.
     * When this original ID needs to be generated, return the mapped version.
     */
    registerMapping(originalId: string, testId: string): void {
        this.idRegistry.set(originalId, testId);
    }

    /**
     * Get all registered mappings
     */
    getMappings(): Map<string, string> {
        return new Map(this.idRegistry);
    }
}

export const nanoidMock = new NanoidMock();

/**
 * Mock implementation of nanoid for Jest
 */
export function createMockNanoid() {
    return jest.fn((size?: number) => {
        return nanoidMock.generate(size || 8);
    });
}

/**
 * Setup nanoid mock for tests. Call this in your test setup.
 */
export function setupNanoidMock(): void {
    jest.mock('nanoid', () => ({
        nanoid: createMockNanoid(),
        customAlphabet: (_alphabet: string, defaultSize: number) => {
            return () => nanoidMock.generate(defaultSize);
        },
    }));
}

/**
 * Reset nanoid mock. Call this in beforeEach.
 */
export function resetNanoidMock(): void {
    nanoidMock.reset();
}