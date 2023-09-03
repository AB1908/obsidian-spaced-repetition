//  import 'react-devtools';
// require('react-devtools');
import {
    Notice,
    Plugin
} from "obsidian";

import { FlashcardModal } from "src/ui/modals/flashcard-modal";
import { appIcon } from "src/icons/appicon";
import { t } from "src/lang/helpers";
import { DEFAULT_SETTINGS, SRSettings, SRSettingTab } from "src/settings";
import type {ParsedCard} from "src/data/models/parsedCard";
import type {Flashcard} from "src/data/models/flashcard";
import {annotation} from "src/data/import/annotations";
import {Book} from "src/data/models/book";

export interface PluginData {
    settings: SRSettings;
    buryDate: string;
    // hashes of card texts
    // should work as long as user doesn't modify card's text
    // which covers most of the cases
    buryList: string[];
    historyDeck: string | null;
}

const DEFAULT_DATA: PluginData = {
    settings: DEFAULT_SETTINGS,
    buryDate: "",
    buryList: [],
    historyDeck: null,
};

export let plugin: SRPlugin;

export default class SRPlugin extends Plugin {
    public data: PluginData;
    public flashcards: Flashcard[] = [];
    public parsedCards: ParsedCard[] = [];
    public annotations: annotation[] = [];
    // todo: fix type
    public notesWithFlashcards: Book[];
    filePaths: string[];
    public bookNotesPaths: string[];

    async onload(): Promise<void> {
        await this.loadPluginData();
        plugin = this;
        // todo: move this initialization to modal opening phase?
        // this.app.metadataCache.on("resolved", () => {
        // });

        appIcon();

        // this.statusBar = this.addStatusBarItem();
        // this.statusBar.classList.add("mod-clickable");
        // this.statusBar.setAttribute("aria-label", t("OPEN_NOTE_FOR_REVIEW"));
        // this.statusBar.setAttribute("aria-label-position", "top");
        // this.statusBar.addEventListener("click", async () => {
        //     if (!this.syncLock) {
        //         // await this.sync();
        //         // this.reviewNextNoteModal();
        //     }
        // });

        this.addRibbonIcon("SpacedRepIcon", t("REVIEW_CARDS"), async () => {
            // if (!this.syncLock) {
                // await this.sync();
                new FlashcardModal(this.app, this).open();
            // }
        });

        this.addCommand({
            id: "srs-review-flashcards",
            name: t("REVIEW_ALL_CARDS"),
            callback: async () => {
                // if (!this.syncLock) {
                    // await this.sync();
                    new FlashcardModal(this.app, this).open();
                // }
            },
        });

        this.addCommand({
            id: "srs-add-flashcard-note",
            name: "Add flashcards for the active note",
            callback: async () => {
                // todo: refactor
                const activeFile = this.app.workspace.getActiveFile();
                if (activeFile === null) {
                    return new Notice("No note active!");
                }
                const fileContents = `---
annotations: "[[${activeFile.path}]]"
---

#flashcards
`;
                await this.app.vault.create(`${activeFile.parent.path}/Flashcards.md`, fileContents);
            }
        });

        this.addSettingTab(new SRSettingTab(this.app, this));

        console.log("SRS Plugin loaded");
    }

    onunload(): void {

    }

    async loadPluginData(): Promise<void> {
        this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
        this.data.settings = Object.assign({}, DEFAULT_SETTINGS, this.data.settings);
    }

    async savePluginData(): Promise<void> {
        await this.saveData(this.data);
    }

    initView(): void {
        // if (this.app.workspace.getLeavesOfType(REVIEW_QUEUE_VIEW_TYPE).length) {
        //     return;
        // }

        // this.app.workspace.getRightLeaf(false).setViewState({
        //     type: REVIEW_QUEUE_VIEW_TYPE,
        //     active: true,
        // });
    }
}