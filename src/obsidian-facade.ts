import {
    moment as obsidianMoment,
    Notice as ObsidianOriginalNotice,
    addIcon as obsidianAddIcon,
    setIcon as obsidianSetIcon,
    Platform as ObsidianPlatform,
    PluginSettingTab as ObsidianPluginSettingTab,
    Setting as ObsidianSetting,
    App as ObsidianApp,
    Modal as ObsidianModal
} from "obsidian";

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

export const moment = obsidianMoment;
export const Platform = ObsidianPlatform;
export const PluginSettingTab = ObsidianPluginSettingTab;
export const Setting = ObsidianSetting;
export const App = ObsidianApp;
export const Modal = ObsidianModal;
