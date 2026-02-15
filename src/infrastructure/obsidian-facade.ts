import {
    moment as obsidianMoment,
    Notice as ObsidianOriginalNotice,
    addIcon as obsidianAddIcon,
    setIcon as obsidianSetIcon,
    Platform as ObsidianPlatform,
    PluginSettingTab as ObsidianPluginSettingTab,
    Setting as ObsidianSetting,
    App,
    Modal as ObsidianModal,
    TFile as ObsidianTFile,
    TFolder as ObsidianTFolder
} from "obsidian";

let app: App;

export function setApp(appInstance: App) {
    app = appInstance;
}

export class ObsidianNotice {
    constructor(message: string | DocumentFragment, timeout?: number) {
        new ObsidianOriginalNotice(message, timeout);
    }
}

export function addIcon(iconId: string, svgContent: string): void {
    obsidianAddIcon(iconId, svgContent);
}

export function setIcon(iconEl: HTMLElement, iconId: string): void {
    obsidianSetIcon(iconEl, iconId);
}

// Vault related facades
export const vault = {
    append: (file: ObsidianTFile, data: string) => app.vault.append(file, data),
    getAbstractFileByPath: (path: string) => app.vault.getAbstractFileByPath(path),
    read: (file: ObsidianTFile) => app.vault.read(file),
    modify: (file: ObsidianTFile, data: string) => app.vault.modify(file, data),
    create: (path: string, data: string) => app.vault.create(path, data),
    createFolder: (path: string) => app.vault.createFolder(path),
    getRoot: () => app.vault.getRoot(),
    getFiles: () => app.vault.getFiles(),
};

// FileManager related facades
export const fileManager = {
    renameFile: (file: ObsidianTFile, newPath: string) => app.fileManager.renameFile(file, newPath),
    processFrontMatter: (file: ObsidianTFile, fn: (frontmatter: any) => void) => app.fileManager.processFrontMatter(file, fn),
};

// MetadataCache related facades
export const metadataCache = {
    get metadataCache() { return app.metadataCache.metadataCache; },
    get fileCache() { return app.metadataCache.fileCache; },
    getFileCache: (file: ObsidianTFile) => app.metadataCache.getFileCache(file),
    getFirstLinkpathDest: (linkpath: string, sourcePath: string) => app.metadataCache.getFirstLinkpathDest(linkpath, sourcePath),
};

export const moment = obsidianMoment;
export const Platform = ObsidianPlatform;
export const PluginSettingTab = ObsidianPluginSettingTab;
export const Setting = ObsidianSetting;
export const Modal = ObsidianModal;
export const TFile = ObsidianTFile;
export const TFolder = ObsidianTFolder;
