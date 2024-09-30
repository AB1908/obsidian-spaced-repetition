module.exports = {
    moment: {
        locale: jest.fn(() => "en"),
    },
    PluginSettingTab: jest.fn().mockImplementation(),
    Platform: {
        get isMobile() {
            jest.fn(() => false);
        },
    },
    Modal: jest.fn().mockImplementation(),
    Plugin: jest.fn().mockImplementation(),
    app: {
        vault: {
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            append: jest.fn(async () => {}),
            create: jest.fn(),
        }
    }
};
