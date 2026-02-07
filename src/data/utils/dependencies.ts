// src/data/models/dependencies.ts

import { Index, AnnotationsNoteIndex } from "../models";
import { FlashcardIndex } from "../models/flashcard";

export interface AnnotationsNoteDependencies {
    flashcardIndex: FlashcardIndex;
    annotationsNoteIndex: AnnotationsNoteIndex;
    fileTagsMap: Map<string, string[]>;
    index: Index;
}