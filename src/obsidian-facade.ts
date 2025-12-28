import { Notice as ObsidianOriginalNotice } from "obsidian";

export class ObsidianNotice {
    constructor(message: string | DocumentFragment, timeout?: number) {
        new ObsidianOriginalNotice(message, timeout);
    }
}
