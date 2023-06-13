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
    highlightId:       string,
}

export class Flashcard implements Flashcard {
    answerText: string;
    cardText: string;
    cardType: number;
    context: string;
    delayBeforeReview: number;
    ease: number;
    id: string;
    interval: number;
    isDue: boolean;
    questionText: string;
    siblings: string[];

    constructor(questionText: string, answerText: string, highlightId: string) {
        this.questionText = questionText;
        this.answerText = answerText;
        this.highlightId = highlightId;
        // todo: replace with uuid generation
        this.id = "uuid here";
    }
}

export function getFlashcardById(id: string) {
    return this.flashcards.filter((t: Flashcard) => t.id===id)[0] ?? null;
}

export function updateFlashcardQuestion(id: string, question: string) {
    const card = this.flashcards.filter((t: Flashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.questionText = question;
    return true;
}

export function createFlashcard(question: string, answer: string, highlightId: string) {
    const card = new Flashcard(question, answer, highlightId);
    this.flashcards.push(card);
    return true;
}