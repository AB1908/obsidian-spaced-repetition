import { selectEligibleSourcePaths } from "src/data/source-discovery";
import type { AnnotationsNoteDependencies } from "src/data/utils/dependencies";
import { AnnotationsNote } from "./AnnotationsNote";

export class AnnotationsNoteIndex {
    sourceNotes: AnnotationsNote[];

    constructor() {
        this.sourceNotes = [];
    }

    async initialize(plugin: AnnotationsNoteDependencies) {
        const candidatePaths = selectEligibleSourcePaths(plugin.fileTagsMap);
        const notesWithAnnotations = candidatePaths.map((t: string) => new AnnotationsNote(t, plugin));
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

    getSourcesWithoutFlashcards(): AnnotationsNote[] {
        return this.sourceNotes.filter(t => !t.flashcardNote);
    }

    getAllAnnotationsNotes(): AnnotationsNote[] {
        return this.sourceNotes;
    }
}
