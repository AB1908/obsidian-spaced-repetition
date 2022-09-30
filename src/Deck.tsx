import { Card } from "src/scheduling";

export class Deck {
    public deckName: string;
    public newFlashcards: Card[];
    public newFlashcardsCount = 0; // counts those in subdecks too
    public dueFlashcards: Card[];
    public dueFlashcardsCount = 0; // counts those in subdecks too
    public totalFlashcards = 0; // counts those in subdecks too
    public subdecks: Deck[];
    public parent: Deck | null;
    public reviewComplete: boolean;

    constructor(deckName: string, parent: Deck | null) {
        this.deckName = deckName;
        this.newFlashcards = [];
        this.newFlashcardsCount = 0;
        this.dueFlashcards = [];
        this.dueFlashcardsCount = 0;
        this.totalFlashcards = 0;
        this.subdecks = [];
        this.parent = parent;
        this.reviewComplete = false;
    }

    createDeck(deckPath: string[]): void {
        if (deckPath.length === 0) {
            return;
        }

        const deckName: string = deckPath.shift();
        for (const deck of this.subdecks) {
            if (deckName === deck.deckName) {
                deck.createDeck(deckPath);
                return;
            }
        }

        const deck: Deck = new Deck(deckName, this);
        this.subdecks.push(deck);
        deck.createDeck(deckPath);
    }

    insertFlashcard(deckPath: string[], cardObj: Card): void {
        if (cardObj.isDue) {
            this.dueFlashcardsCount++;
        } else {
            this.newFlashcardsCount++;
        }
        this.totalFlashcards++;

        if (deckPath.length === 0) {
            if (cardObj.isDue) {
                this.dueFlashcards.push(cardObj);
            } else {
                this.newFlashcards.push(cardObj);
            }
            return;
        }

        const deckName: string = deckPath.shift();
        for (const deck of this.subdecks) {
            if (deckName === deck.deckName) {
                deck.insertFlashcard(deckPath, cardObj);
                return;
            }
        }
    }

    // count flashcards that have either been buried
    // or aren't due yet
    countFlashcard(deckPath: string[], n = 1): void {
        this.totalFlashcards += n;

        const deckName: string = deckPath.shift();
        for (const deck of this.subdecks) {
            if (deckName === deck.deckName) {
                deck.countFlashcard(deckPath, n);
                return;
            }
        }
    }

    // deleteFlashcardAtIndex(index: number, cardIsDue: boolean): void {
    //     if (cardIsDue) {
    //         this.dueFlashcards.splice(index, 1);
    //         this.dueFlashcardsCount--;
    //     } else {
    //         this.newFlashcards.splice(index, 1);
    //         this.newFlashcardsCount--;
    //     }
    //     let deck: Deck = this.parent;
    //     while (deck !== null) {
    //         if (cardIsDue) {
    //             deck.dueFlashcardsCount--;
    //         } else {
    //             deck.newFlashcardsCount--;
    //         }
    //         deck = deck.parent;
    //     }
    // }

    sortSubdecksList(): void {
        this.subdecks.sort((a, b) => {
            if (a.deckName < b.deckName) {
                return -1;
            } else if (a.deckName > b.deckName) {
                return 1;
            }
            return 0;
        });

        for (const deck of this.subdecks) {
            deck.sortSubdecksList();
        }
    }
}
