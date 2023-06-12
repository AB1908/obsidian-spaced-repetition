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

describe('updateFlashcardQuestion', () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundUpdate: any;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards
        };
        boundUpdate = updateFlashcardQuestion.bind(mockThis);
    });

    test('should update the questionText of the flashcard with the given id', () => {
        const updatedQuestion = 'What is your age?';
        const id = "yjlML2s9W";

        expect(boundUpdate(id, updatedQuestion)).toBe(true);
        expect(mockThis.flashcards[0].questionText).toBe(updatedQuestion);
    });

    test('should return false if the flashcard with the given id does not exist', () => {
        const nonExistingId = '3';
        const updatedQuestion = 'What is your age?';

        expect(boundUpdate(nonExistingId, updatedQuestion)).toBe(false);
    });
});