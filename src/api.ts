// TODO: decks need to not be coupled directly to the file contents, those should be separate
// TODO: decide what unique key that a deck
export const deck = {
    id: 3,
    deckName: "Deck1",
    chapters: [
        {
            id: 1,
            title: "Chapter 1",
            highlights: [
                {
                    id: 1,
                    highlightContent: "This is a sample highlight from chapter 1",
                    highlightNote: "Just another note here, testing",
                    flashcards: [
                        {
                            questionText: "This is a flashcard from question 1",
                            answerText: "This is the answer to that question"
                        },
                        {
                            questionText: "Flashcard 2 from chapter 1",
                            answerText: "Answer 2"
                        },
                    ]
                },
                {
                    id: 2,
                    highlightContent: "This is a sample highlight but without a note but also in chapter 1",
                    //TODO: think about whether this should be a null or an empty string on the backend
                    highlightNote: "",
                    flashcards: []
                },
            ],
        },
        {
            id: 2,
            title: "Chapter 2",
            highlights: [
                {
                    id: 1,
                    highlightContent: "This is a sample highlight chapter 2",
                    highlightNote: "This is a note for that highlight chapter 2",
                    flashcards: []
                },
                {
                    id: 2,
                    highlightContent: "This is a sample highlight but without a note",
                    //TODO: think about whether this should be a null or an empty string on the backend
                    highlightNote: "",
                    flashcards: [
                        {
                            questionText: "This is a flashcard question that asks about highlight 2 and is from chapter 2",
                            answerText: "This is the answer to that question"
                        },
                        {
                            questionText: "Flashcard 2 from chapter 2",
                            answerText: "Answer 2"
                        },
                    ]
                },
            ],
        },
    ]
};