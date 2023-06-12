export interface Flashcard {
    id:                string,
    isDue:             boolean,
    questionText:      string,
    answerText:        string,
    cardText:          string,
    context:           string,
    cardType:          number,
    siblings:          string[],
    interval:          number,
    ease:              number,
    delayBeforeReview: number,
}

export function getFlashcardById(id: string) {
    return this.flashcards.filter((t: Flashcard) => t.id===id)[0] ?? null;
}