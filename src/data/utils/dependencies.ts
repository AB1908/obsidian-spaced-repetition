// src/data/models/dependencies.ts

import { Index } from "../models";
import { FlashcardIndex } from "../models/flashcard";
import { SourceNoteIndex } from "../models/sourceNote";

export interface SourceNoteDependencies {
    flashcardIndex: FlashcardIndex;
    sourceNoteIndex: SourceNoteIndex;
    fileTagsMap: Map<string, string[]>;
    index: Index;
}
