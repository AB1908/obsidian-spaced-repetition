export interface Flashcard {
    id:                string,
    isDue:             boolean,
    questionText:      string,
    answerText:        string,
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
        this.answerText = null;
        this.cardType = null;
        this.context = null;
        this.delayBeforeReview = null;
        this.ease = null;
        this.interval = null;
        this.isDue = null;
        this.siblings = [];
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

export function updateFlashcardAnswer(id: string, answer: string) {
    const card = this.flashcards.filter((t: Flashcard) => t.id === id)[0];
    if (card === undefined) {
        return false;
    }
    card.answerText = answer;
    return true;
}

export async function createParsedCard(questionText: string, answerText: string, cardType: CardType, path: string, highlightId: string): Promise<ParsedCard> {
    const parsedCard = {
        id: nanoid(8),
        note: getTFileForPath(path),
        cardText: cardTextGenerator(questionText, answerText, cardType),
        metadataText: metadataTextGenerator(highlightId, null),
        // TODO: remove lineno
        lineNo: 0,
        cardType: cardType,
    };
    await writeCardToDisk(parsedCard.note, generateCardAsStorageFormat(parsedCard));
    this.parsedCards.push(parsedCard);
    return parsedCard;
}

export async function createFlashcardForHighlight(question: string, answer: string, highlightId: string, cardType: CardType) {
    let card;
    if (cardType == CardType.MultiLineBasic) {
        card = new Flashcard(question, answer, highlightId);
    }
    this.flashcards.push(card);
    return true;
}

export function deleteFlashcardById(id: string) {
    if (this.flashcards.length == 0) {
        throw new Error("Array of flashcards is empty!")
    }
    if (this.flashcards.findIndex((f: Flashcard) => f.id === id) == -1) {
        return false;
    }
    this.flashcards = this.flashcards.filter((f: Flashcard) => f.id !== id);
    return true;
}