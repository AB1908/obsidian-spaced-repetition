import { Notice as ObsidianOriginalNotice, addIcon as obsidianAddIcon, setIcon as obsidianSetIcon } from "obsidian";

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
