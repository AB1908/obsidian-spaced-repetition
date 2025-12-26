// src/data/models/dependencies.ts

import { Index } from ".";
import { FlashcardIndex } from "./flashcard";
import { SourceNoteIndex } from "./sourceNote";

export interface SourceNoteDependencies {
    flashcardIndex: FlashcardIndex;
    sourceNoteIndex: SourceNoteIndex;
    fileTagsMap: Map<string, string[]>;
    index: Index;
}
