import { FlashcardIndex } from "src/data/models/flashcard";
import { annotation } from "src/data/models/annotations";
import { paragraph } from "src/data/models/paragraphs";
import { SourceNoteIndex } from "src/data/models/sourceNoteIndex";
import SRPlugin from "src/main";
import { fileTags } from "src/data/disk";

export class Index {
    sourceNoteIndex: SourceNoteIndex;
    flashcardIndex: FlashcardIndex;
    annotationIndex: Map<string, (paragraph|annotation)>;
    fileTagsMap: Map<string, string[]>; // { "path": [array of tags] }

    constructor() {
        this.annotationIndex = new Map<string, paragraph | annotation>();
        this.flashcardIndex = new FlashcardIndex();
        this.sourceNoteIndex = new SourceNoteIndex();
        this.fileTagsMap = new Map<string, string[]>();
    }

    async initialize(plugin: SRPlugin) {
        // this needs to be initialized before everything else
        // todo: add logic in other inits to make sure fileTagsMap is inited first
        this.fileTagsMap = fileTags();
        await this.flashcardIndex.initialize();
        await this.sourceNoteIndex.initialize(plugin);
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