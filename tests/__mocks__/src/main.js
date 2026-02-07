// tests/__mocks__/src/main.js

// This object will be the actual mocked 'plugin' instance.
// Tests can directly modify its properties.
const mockedPluginInstance = {
    app: {},
    fileTagsMap: new Map(),
    data: {
        settings: {
            "baseEase": 250,
            "lapsesIntervalChange": 0.5,
            "easyBonus": 1.3,
            "maximumInterval": 36525,
        },
    },
    annotationsNoteIndex: {
        getBook: jest.fn(),
        initialize: jest.fn(() => Promise.resolve()),
        getSourcesForReview: jest.fn(),
        getSourcesWithoutFlashcards: jest.fn(),
    },
    flashcardIndex: {
        initialize: jest.fn(() => Promise.resolve()),
        addFlashcardNoteToIndex: jest.fn(),
    },
};

// Export the mocked instance as the named export 'plugin'
module.exports = {
    plugin: mockedPluginInstance,
};