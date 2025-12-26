// tests/__mocks__/plugin.ts

import { SourceNoteDependencies } from "src/data/models/dependencies";

// This mock is designed to be very lightweight and synchronous for Jest's module mocking.

/**
 * Creates a mock instance of the SRPlugin for testing.
 *
 * @param overrides - An object to override specific properties of the mock plugin.
 *                    This allows you to tailor the mock's behavior for each test.
 *                    For example, you can provide a mock implementation for `sourceNoteIndex.getBook`.
 */
export function createMockPlugin(overrides?: any): SourceNoteDependencies {
    const defaultMock = {
        // Mock the properties that your API functions actually use
        sourceNoteIndex: {
            getBook: jest.fn().mockReturnValue(null), // Default to returning null
            getSourcesForReview: jest.fn().mockReturnValue([]),
            getSourcesWithoutFlashcards: jest.fn().mockReturnValue([]),
            addToAnnotationIndex: jest.fn(),
        },
        flashcardIndex: {
            addFlashcardNoteToIndex: jest.fn(),
            flashcardNotes: [],
        },
        data: {
            settings: {}, // Minimal mock for settings
            buryDate: "",
            buryList: [],
        },
        fileTagsMap: new Map(),
        index: {}, // Minimal mock for Index
        app: {
            // Mock app properties if needed by your API functions
            vault: {},
            metadataCache: {},
        }
    };

    // Deep merge for overrides
    const mergeDeep = (target: any, source: any) => {
        const output = { ...target };
        if (target && typeof target === 'object' && source && typeof source === 'object') {
            Object.keys(source).forEach(key => {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' ) {
                    output[key] = mergeDeep(target[key], source[key]);
                } else {
                    output[key] = source[key];
                }
            });
        }
        return output;
    };

    return mergeDeep(defaultMock, overrides);
    // A simple merge for overrides. A deep merge would be an improvement for more complex tests.
    return { ...defaultMock, ...overrides };
}
