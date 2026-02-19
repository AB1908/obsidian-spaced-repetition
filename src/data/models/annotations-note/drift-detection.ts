import type { Flashcard } from "src/data/models/flashcard";
import type { BookMetadataSections } from "../sections/types";
import { isParagraph } from "../sections/guards";
import { hasContentDrifted } from "src/data/utils/fingerprint";

export function detectDriftedSections(
    bookSections: BookMetadataSections,
    flashcards: Flashcard[]
) {
    for (const section of bookSections) {
        if (!isParagraph(section) || !section.hasFlashcards) continue;
        const linkedCards = flashcards.filter(f => f.parentId === section.id);
        for (const card of linkedCards) {
            if (card.fingerprint && hasContentDrifted(card.fingerprint, section.text)) {
                section.drifted = true;
                break;
            }
        }
    }
}
