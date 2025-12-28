import { Plugin } from "obsidian";
import { FlashcardModal } from "src/ui/modals/flashcard-modal";
import { appIcon } from "src/icons/appicon";
import { t } from "src/lang/helpers";
import { DEFAULT_SETTINGS, SRSettings, SRSettingTab } from "src/settings";
import { FlashcardIndex } from "src/data/models/flashcard";
import { SourceNoteIndex } from "src/data/models/sourceNote";
import { fileTags } from "src/data/disk";
import { setPlugin } from "src/api";
import { setApp } from "src/obsidian-facade";
import { Index } from "src/data/models";
import { SourceNoteDependencies } from "src/data/models/dependencies";

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

export default class SRPlugin extends Plugin implements SourceNoteDependencies {
    public data: PluginData;
    // todo: fix type
    public bookNotesPaths: string[];
    public flashcardIndex: FlashcardIndex; // should have path and array of flashcards?
    public sourceNoteIndex: SourceNoteIndex;
    // todo: move this down into the index
    public fileTagsMap: Map<string, string[]>; // { "path": [array of tags] }
    public index: Index;
    private isInitialized = false;

    async onload(): Promise<void> {
        await this.loadPluginData();

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        plugin = this;
        setPlugin(this);
        setApp(this.app);

        // // First need to initialize tags as the source notes will use this
        // this.app.workspace.onLayoutReady(async () => {
        // });

        this.index = new Index();
        this.flashcardIndex = new FlashcardIndex();
        this.sourceNoteIndex = new SourceNoteIndex();
        this.app.workspace.onLayoutReady(async () => {
            console.log("Layout ready, checking metadata...");

            await this.onceMetadataLoaded();

            console.log("Metadata is definitely ready now!");
            this.isInitialized = true;
            this.fileTagsMap = fileTags();
            this.flashcardIndex = await this.flashcardIndex.initialize();
            this.sourceNoteIndex = await this.sourceNoteIndex.initialize(this);
        })
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

        console.log("SRS Plugin loaded");
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    onunload(): void {

    }

    async onceMetadataLoaded() {
        // 1. Wait for the layout to be ready first
        await new Promise((resolve) => {
            this.app.workspace.onLayoutReady(() => resolve(null));
        });

        // 2. Check if the cache is already initialized
        // @ts-ignore - 'initialized' is an internal property but very stable
        if (this.app.metadataCache.initialized) {
            return;
        }

        // 3. If not initialized, wait for the 'resolved' event
        return new Promise((resolve) => {
            const eventRef = this.app.metadataCache.on('resolved', () => {
                this.app.metadataCache.offref(eventRef); // Clean up the listener
                resolve(null);
            });
            this.registerEvent(eventRef);
        });
    }

    async loadPluginData(): Promise<void> {
        this.data = Object.assign({}, DEFAULT_DATA, await this.loadData());
        this.data.settings = Object.assign({}, DEFAULT_SETTINGS, this.data.settings);
    }

    async savePluginData(): Promise<void> {
        await this.saveData(this.data);
    }
}