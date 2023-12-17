import { SourceNote } from "src/data/models/sourceNote";
import { FlashcardNote } from "src/data/models/flashcard";
import { annotation } from "src/data/models/annotations";
import { paragraph } from "src/data/models/paragraphs";

export class Index {
    sourceNoteIndex: Map<string, SourceNote>;
    flashcardNoteIndex: Map<string, FlashcardNote>;
    annotationIndex: Map<string, (paragraph|annotation)>

    constructor() {
        this.annotationIndex = new Map<string, paragraph | annotation>();
    }

    initialize() {

    }

    addToAnnotationIndex(block: annotation|paragraph) {
        // todo: think about incorporating an index dirty state to
        // properly retrigger indexing
        this.annotationIndex.set(block.id, block);
    }

    getAnnotation(blockId: string) {
        return this.annotationIndex.get(blockId);
    }
}