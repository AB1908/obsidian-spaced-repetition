import 'whatwg-fetch';
import '@testing-library/jest-dom';
// Polyfill for structuredClone for Jest environment
if (typeof global.structuredClone === 'undefined') {
    global.structuredClone = (val) => {
        if (val === undefined) {
            return undefined;
        }
        try {
            return JSON.parse(JSON.stringify(val));
        } catch (e) {
            if (typeof val === 'object' && val !== null) {
                return Array.isArray(val) ? [...val] : { ...val };
            }
            return val;
        }
    };
}

jest.mock("obsidian", () => {
    // This is the mock for the 'obsidian' module itself
    const mockMoment = jest.fn((...args) => {
        // This is what moment() or moment(date) returns (an instance)
        const mockInstance = {
            format: jest.fn((fmt) => {
                if (fmt === "YYYY-MM-DD") return "2025-12-28";
                return "2025-12-28";
            }),
            valueOf: jest.fn(() => 1703793600000),
            diff: jest.fn(() => 0),
            locale: jest.fn(() => "en"),
            isSameOrBefore: jest.fn(() => true),
            // Add any other methods called on moment instances like add, subtract etc.
        };
        // If moment is called with arguments, you might want to adjust mockInstance based on them
        return mockInstance;
    });

    // Attach static methods directly to the mockMoment function
    mockMoment.locale = jest.fn(() => "en"); // This is for moment.locale() calls

    return {
        // Exports from the 'obsidian' module that are used directly or re-exported by facades
        moment: mockMoment,
        addIcon: jest.fn(),
        setIcon: jest.fn(), // This should be picked up by the facade
        Notice: jest.fn(),
        Platform: {
            isMobile: false,
            isDesktop: true,
        },
        PluginSettingTab: jest.fn(),
        Setting: jest.fn(),
        Modal: jest.fn(),
        TFile: jest.fn(),
        TFolder: jest.fn(),
        App: jest.fn(),
    };
});

jest.mock("src/infrastructure/obsidian-facade", () => {
    const mockedObsidian = jest.requireMock("obsidian");
    return {
        setIcon: mockedObsidian.setIcon,
        moment: mockedObsidian.moment,
        ObsidianNotice: mockedObsidian.Notice,
        Platform: mockedObsidian.Platform,
        PluginSettingTab: mockedObsidian.PluginSettingTab,
        Setting: mockedObsidian.Setting,
        Modal: mockedObsidian.Modal,
        TFile: mockedObsidian.TFile,
        TFolder: mockedObsidian.TFolder,
        addIcon: mockedObsidian.addIcon,
        setApp: jest.fn(),
        vault: {
            append: jest.fn(),
            getAbstractFileByPath: jest.fn(),
            read: jest.fn(),
            modify: jest.fn(),
            create: jest.fn(),
            getRoot: jest.fn(),
            getFiles: jest.fn(),
        },
        fileManager: {
            renameFile: jest.fn(),
            processFrontMatter: jest.fn(),
        },
        metadataCache: {
            metadataCache: {},
            fileCache: {},
            getFileCache: jest.fn(),
            getFirstLinkpathDest: jest.fn(),
        },
    };
});