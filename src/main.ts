import { Plugin } from "obsidian";
import { FlashcardModal } from "src/ui/modals/flashcard-modal";
import { appIcon } from "src/icons/appicon";
import { t } from "src/lang/helpers";
import { DEFAULT_SETTINGS, SRSettings, SRSettingTab } from "src/settings";
import { FlashcardIndex } from "src/data/models/flashcard";
import { fileTags } from "src/data/disk";
import { Index } from "src/data/models";
import { SourceNoteIndex } from "src/data/models/sourceNoteIndex";

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
export let sourceNoteIndex: SourceNoteIndex;
export let flashcardIndex: FlashcardIndex;

export default class SRPlugin extends Plugin {
    public data: PluginData;
    // todo: fix type
    public bookNotesPaths: string[];
    public flashcardIndex: FlashcardIndex; // should have path and array of flashcards?
    public sourceNoteIndex: SourceNoteIndex;
    // todo: move this down into the index
    public fileTagsMap: Map<string, string[]>; // { "path": [array of tags] }
    public index: Index;

    async onload(): Promise<void> {
        await this.loadPluginData();
        // First need to initialize tags as the source notes will use this
        this.index = new Index();
        this.flashcardIndex = new FlashcardIndex();
        this.sourceNoteIndex = new SourceNoteIndex();
        this.app.workspace.onLayoutReady(async () => {
            this.fileTagsMap = fileTags();
            this.flashcardIndex = await this.flashcardIndex.initialize();
            this.sourceNoteIndex = await this.sourceNoteIndex.initialize(this);
            flashcardIndex = this.flashcardIndex;
            sourceNoteIndex = this.sourceNoteIndex;
        });
        // done: eventually remove this and add access method for sourcenoteindex

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