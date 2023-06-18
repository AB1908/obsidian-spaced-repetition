import {
    createFlashcard,
    getFlashcardById,
    updateFlashcardQuestion,
    deleteFlashcardById,
    updateFlashcardAnswer
} from "src/controller";
import type {Flashcard} from "src/controller";
import mock = jest.mock;

const flashcards: () => Flashcard[] = () => [{
    "id": "yjlML2s9W",
    "isDue": true,
    "questionText": " i-Estel Edain, ú-chebin estel anim.",
    "answerText": "Onen",
    "context": "",
    "cardType": 4,
    "siblings": [],
    "interval": 2,
    "ease": 230,
    "delayBeforeReview": 17662032301,
    highlightId: "d9fasdkf9",
}];

describe('getFlashcardById', () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundGet: any;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards()
        };
        boundGet = getFlashcardById.bind(mockThis);
    });

    test("retrieves a flashcard successfully", () => {
        expect(boundGet("yjlML2s9W")).toStrictEqual(mockThis.flashcards[0]);
        expect(boundGet("aaaa")).toEqual(null);
    });
});

describe('updateFlashcardQuestion', () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundUpdate: any;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards()
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

describe('updateFlashcardAnswer', () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundUpdate: any;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards()
        };
        boundUpdate = updateFlashcardAnswer.bind(mockThis);
    });

    test('should update the questionText of the flashcard with the given id', () => {
        const updatedAnswer = 'What is your age?';
        const id = "yjlML2s9W";

        expect(boundUpdate(id, updatedAnswer)).toBe(true);
        expect(mockThis.flashcards[0].answerText).toBe(updatedAnswer);
    });

    test('should return false if the flashcard with the given id does not exist', () => {
        const nonExistingId = '3';
        const updatedQuestion = 'What is your age?';

        expect(boundUpdate(nonExistingId, updatedQuestion)).toBe(false);
    });
});

describe("createFlashcard", () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundCreate: typeof createFlashcard;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards()
        };
        boundCreate = createFlashcard.bind(mockThis);
    });

    test('should create a new flashcard', () => {
        const question = 'What is your age?';
        const answer = "test answer";
        const id = "yjlML2s9W";
        const highlightId = "9asdfkn23k";
        boundCreate(question, answer, highlightId);
        expect(mockThis.flashcards[1].questionText).toBe(question);
    });
});

describe("deleteFlashcard", () => {
    let mockThis: { flashcards: Flashcard[] };
    let boundDelete: typeof deleteFlashcardById;

    beforeEach(() => {
        mockThis = {
            flashcards: flashcards()
        };
        boundDelete = deleteFlashcardById.bind(mockThis);
    });

    test('should delete an existing flashcard', () => {
        const id = "yjlML2s9W";
        expect(boundDelete(id)).toBe(true);
        expect(mockThis.flashcards).toStrictEqual([]);
    });

    test('should return false if flashcard doesn\'t exist', () => {
        const id = "aaaa";
        expect(boundDelete(id)).toBe(false);
        expect(mockThis.flashcards).toStrictEqual(flashcards());
    });

    test('should throw an error when trying to delete from an empty flashcard array', () => {
        mockThis.flashcards = [];
        boundDelete = deleteFlashcardById.bind(mockThis);
        const id = "aaaa";
        expect(() => boundDelete(id)).toThrow();
    });
});
