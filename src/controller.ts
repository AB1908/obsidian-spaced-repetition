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

export function updateFlashcardQuestion(id: string, question: string) {
    const card = this.flashcards.filter(t => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.questionText = question;
    return true;
}