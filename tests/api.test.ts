import {getFlashcardById, updateFlashcardQuestion} from "src/controller";
import type {Flashcard} from "src/controller";

const flashcards: Flashcard[] = [{
    "id": "yjlML2s9W",
    "isDue": true,
    "questionText": " i-Estel Edain, ú-chebin estel anim.",
    "answerText": "Onen",
    "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.\n<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
    "context": "",
    "cardType": 4,
    "siblings": [],
    "interval": 2,
    "ease": 230,
    "delayBeforeReview": 17662032301
}];

describe('getFlashcardById', () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundGet: any;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards
        };
        boundGet = getFlashcardById.bind(mockThis);
    });

    test("retrieves a flashcard successfully", () => {
        expect(boundGet("yjlML2s9W")).toStrictEqual(flashcards[0]);
        expect(boundGet("aaaa")).toEqual(null);
    });
});