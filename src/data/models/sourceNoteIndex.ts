import type SRPlugin from "src/main";
import { SourceNote } from "src/data/models/sourceNote";

export class SourceNoteIndex {
    sourceNotes: SourceNote[];

    constructor() {
        this.sourceNotes = [];
    }

    async initialize(plugin: SRPlugin) {
        // iterate over tags in plugin
        // create set from tags in note
        // check membership of tag
        const tagsInSettings = ["review/note", "review/book"];
        const pathsWithAllowedTags = new Set<string>();
        for (let [path, tags] of plugin.fileTagsMap) {
            const tagSet = new Set(tags);
            for (let tag of tagsInSettings) {
                if (tagSet.has(tag)) {
                    pathsWithAllowedTags.add(path);
                    break;
                }
            }
        }
        //todo: parameterize
        // const filePaths = filePathsWithTag("review/note");
        const notesWithAnnotations = Array.from(pathsWithAllowedTags.keys()).map((t: string) => new SourceNote(t, plugin));
        for (const t of notesWithAnnotations) {
            try {
                await t.initialize();
            } catch (e) {
                // WARNING! this is dangerous, I am catching other errors and just assuming that
                // these are this error
                console.error(e);
                console.error(`init: unable to initialize source note ${t.path}`);
            }
        }
        this.sourceNotes = notesWithAnnotations;
        console.log("Card Coverage: Source note index successfully initialized");
        return this;
    }

    getBook(bookId: string) {
        const book = this.sourceNotes.filter(t => t.id === bookId)[0];
        if (!book) {
            throw new Error(`No book found for id ${bookId}`);
        }
        return book;
    }

    getSourcesForReview() {
        return this.sourceNotes.filter(t => t.flashcardNote);
    }

    getSourcesWithoutFlashcards(): SourceNote[] {
        return this.sourceNotes.filter(t => !t.flashcardNote);
    }
}