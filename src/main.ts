import { Plugin } from "obsidian";
import { FlashcardModal } from "src/ui/modals/flashcard-modal";
import { appIcon } from "src/icons/appicon";
import { t } from "src/lang/helpers";
import { DEFAULT_SETTINGS, SRSettings, SRSettingTab } from "src/settings";
import { Index } from "src/data/models";
import * as console from "node:console";

export interface PluginData {
    settings: SRSettings;
    buryDate: string;
    // hashes of card texts
    // should work as long as user doesn't modify card's text
    // which covers most of the cases
    buryList: string[];
}

const DEFAULT_DATA: PluginData = {
    settings: DEFAULT_SETTINGS,
    buryDate: "",
    buryList: [],
};

export let plugin: SRPlugin;

export default class SRPlugin extends Plugin {
    public data: PluginData;
    // todo: fix type
    public bookNotesPaths: string[];
    public index: Index;

    async onload(): Promise<void> {
        await this.loadPluginData();
        this.index = new Index();
        this.app.workspace.onLayoutReady(async () => {
            await this.index.initialize(this);
        });

        appIcon();

        this.addRibbonIcon("SpacedRepIcon", t("REVIEW_CARDS"), async () => {
            new FlashcardModal(this).open();
        });

        this.addCommand({
            id: "srs-review-flashcards",
            name: t("REVIEW_ALL_CARDS"),
            callback: async () => {
                new FlashcardModal(this).open();
            }
        });

        this.addSettingTab(new SRSettingTab(this.app, this));

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        plugin = this;

        console.log("SRS Plugin loaded");
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onunload(): void {

    }

    async loadPluginData(): Promise<void> {
        this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
        this.data.settings = Object.assign({}, DEFAULT_SETTINGS, this.data.settings);
    }

    async savePluginData(): Promise<void> {
        await this.saveData(this.data);
    }
}