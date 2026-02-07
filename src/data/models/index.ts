import { AnnotationsNote } from "./AnnotationsNote";
import { FlashcardNote } from "./flashcard";
import { annotation } from "./annotations";
import { paragraph } from "./paragraphs";

export * from "./annotations";
export * from "./bookTree";
export * from "./flashcard";
export * from "./paragraphs";
export * from "./parsedCard";
export * from "./AnnotationsNote";
export * from "./Source";
export * from "./ISourceStrategy";
export * from "./strategies/MoonReaderStrategy";

export class Index {
    annotationsNoteIndex: Map<string, AnnotationsNote>;
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