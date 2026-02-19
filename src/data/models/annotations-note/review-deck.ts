import type { Flashcard } from "src/data/models/flashcard";

// copied from https://stackoverflow.com/a/12646864/13285428
export function shuffledReviewDeck(flashcards: Flashcard[]): Flashcard[] {
    const reviewDeck = [...flashcards].filter(t => t.isDue());
    for (let i = reviewDeck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [reviewDeck[i], reviewDeck[j]] = [reviewDeck[j], reviewDeck[i]];
    }
    return reviewDeck;
}
