//  import 'react-devtools';
// require('react-devtools');
import {
    Plugin, TFile
} from "obsidian";

import { FlashcardModal } from "src/flashcard-modal";
import { appIcon } from "src/icons/appicon";
import { t } from "src/lang/helpers";
import { DEFAULT_SETTINGS, SRSettings, SRSettingTab } from "src/settings";
import { REVIEW_QUEUE_VIEW_TYPE } from "src/sidebar";
import { StatsModal } from "src/stats-modal";

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

export interface SchedNote {
    note: TFile;
    dueUnix: number;
}

export interface LinkStat {
    sourcePath: string;
    linkCount: number;
}

export default class SRPlugin extends Plugin {
    public data: PluginData;
    // public syncLock = false;

    // public reviewDecks: { [deckKey: string]: ReviewDeck } = {};
    // public lastSelectedReviewDeck: string;

    // public newNotes: TFile[] = [];
    // public scheduledNotes: SchedNote[] = [];
    public easeByPath: Record<string, number> = {};
    // public dueDatesNotes: Record<number, number> = {}; // Record<# of days in future, due count>

    // public deckTree: Deck = new Deck("root", null);
    public dueDatesFlashcards: Record<number, number> = {}; // Record<# of days in future, due count>
    // public cardStats: Stats;

    async onload(): Promise<void> {
        await this.loadPluginData();

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
            id: "srs-review-flashcards-in-note",
            name: t("REVIEW_CARDS_IN_NOTE"),
            callback: async () => {
                const openFile: TFile | null = this.app.workspace.getActiveFile();
                if (openFile && openFile.extension === "md") {
                    // this.deckTree = new Deck("root", null);
                    // const deckPath: string[] = this.findDeckPath(openFile);
                    // await this.findFlashcardsInNote(openFile, deckPath);
                    new FlashcardModal(this.app, this).open();
                }
            },
        });

        this.addCommand({
            id: "srs-cram-flashcards-in-note",
            name: t("CRAM_CARDS_IN_NOTE"),
            callback: async () => {
                const openFile: TFile | null = this.app.workspace.getActiveFile();
                if (openFile && openFile.extension === "md") {
                    // this.deckTree = new Deck("root", null);
                    // const deckPath: string[] = this.findDeckPath(openFile);
                    // await this.findFlashcardsInNote(openFile, deckPath, false, true);
                    new FlashcardModal(this.app, this, true).open();
                }
            },
        });

        this.addCommand({
            id: "srs-view-stats",
            name: t("VIEW_STATS"),
            callback: async () => {
                // if (!this.syncLock) {
                    // await this.sync();
                    new StatsModal(this.app, this).open();
                // }
            },
        });

        this.addSettingTab(new SRSettingTab(this.app, this));

        this.app.workspace.onLayoutReady(() => {
            this.initView();
            setTimeout(async () => {
                // if (!this.syncLock) {
                    // await this.sync();
                // }
            }, 2000);
        });
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
        if (this.app.workspace.getLeavesOfType(REVIEW_QUEUE_VIEW_TYPE).length) {
            return;
        }

        this.app.workspace.getRightLeaf(false).setViewState({
            type: REVIEW_QUEUE_VIEW_TYPE,
            active: true,
        });
    }
}