// test-utils/fixture-transformer.ts
import { createHash } from 'crypto';
import { nanoidMock } from './nanoid-mock';

/**
 * Transforms IDs in fixture data to deterministic test IDs while preserving relationships.
 */
export class FixtureTransformer {
    private idMap = new Map<string, string>();
    private reverseIdMap = new Map<string, string>(); // testId -> originalId

    /**
     * Reset the transformer state between tests
     */
    reset(): void {
        this.idMap.clear();
        this.reverseIdMap.clear();
    }

    /**
     * Transform a fixture, replacing all IDs with deterministic test IDs
     */
    transform(fixture: any): any {
        if (fixture === null || fixture === undefined) {
            return fixture;
        }

        // Handle Maps specially
        if (fixture instanceof Map) {
            const transformed = new Map();
            for (const [key, value] of fixture.entries()) {
                transformed.set(
                    this.transformValue(key),
                    this.transformValue(value)
                );
            }
            return transformed;
        }

        return this.transformValue(fixture);
    }

    private transformValue(value: any): any {
        if (value === null || value === undefined) {
            return value;
        }

        // Handle primitives
        if (typeof value !== 'object') {
            return value;
        }

        // Handle arrays
        if (Array.isArray(value)) {
            return value.map(item => this.transformValue(item));
        }

        // Handle Maps
        if (value instanceof Map) {
            const transformed = new Map();
            for (const [k, v] of value.entries()) {
                transformed.set(
                    this.transformValue(k),
                    this.transformValue(v)
                );
            }
            return transformed;
        }

        // Handle Date objects (preserve them)
        if (value instanceof Date) {
            return value;
        }

        // Handle objects
        const transformed: any = {};
        for (const [key, val] of Object.entries(value)) {
            if (this.isIdField(key, val)) {
                transformed[key] = this.mapId(val as string);
            } else {
                transformed[key] = this.transformValue(val);
            }
        }

        return transformed;
    }

    /**
     * Determines if a field is an ID field that should be transformed
     */
    private isIdField(key: string, value: any): boolean {
        if (typeof value !== 'string') {
            return false;
        }

        // Don't transform date strings
        if (this.looksLikeDate(value)) {
            return false;
        }

        // Don't transform file paths or URLs
        if (value.includes('/') || value.includes('\\') || value.includes('.')) {
            return false;
        }

        // Common ID field patterns
        const idPatterns = [
            /^id$/i,
            /Id$/,
            /_id$/i,
            /parentId$/i,
        ];

        const matchesPattern = idPatterns.some(pattern => pattern.test(key));
        const looksLikeId = this.looksLikeYourIdFormat(value);

        return matchesPattern && looksLikeId;
    }

    private looksLikeDate(value: string): boolean {
        return /^\d{4}-\d{2}-\d{2}/.test(value);
    }

    private looksLikeYourIdFormat(value: string): boolean {
        if (value.length < 3 || value.length > 20) {
            return false;
        }
        return /^[A-Za-z0-9-]+$/.test(value);
    }

    /**
     * Maps a production ID to a deterministic test ID
     */
    private mapId(originalId: string): string {
        if (!this.idMap.has(originalId)) {
            // Create deterministic ID based on original
            const hash = createHash('sha256')
                .update(originalId)
                .digest('base64url');

            // Preserve original length for compatibility
            const testId = `t${hash.slice(0, originalId.length - 1)}`;
            this.idMap.set(originalId, testId);
            this.reverseIdMap.set(testId, originalId);

            // Register with nanoid mock so when code generates IDs,
            // we can return consistent ones
            nanoidMock.registerMapping(originalId, testId);
        }

        return this.idMap.get(originalId)!;
    }

    /**
     * Get the mapped test ID for a given original ID
     */
    getMappedId(originalId: string): string | undefined {
        return this.idMap.get(originalId);
    }

    /**
     * Get the original ID for a given test ID
     */
    getOriginalId(testId: string): string | undefined {
        return this.reverseIdMap.get(testId);
    }

    /**
     * Get all ID mappings
     */
    getIdMappings(): Map<string, string> {
        return new Map(this.idMap);
    }
}

export const fixtureTransformer = new FixtureTransformer();