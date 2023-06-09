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
                    color: "#fda6ce",
                    highlightContent: "This is a sample highlight from chapter 1",
                    highlightNote: "Just another note here, testing",
                    flashcards: [
                        {
                            "isDue": true,
                            "note": null,
                            "questionText": " i-Estel Edain, ú-chebin estel anim.",
                            "answerText": "Onen",
                            "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.\n<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
                            "context": "",
                            "cardType": 4,
                            "siblings": [],
                            "clozeInsertionAt": 0,
                            "interval": 2,
                            "ease": 230,
                            "delayBeforeReview": 17662032301
                        },
                        {
                            questionText: "Flashcard 2 from chapter 1",
                            answerText: "Answer 2"
                        },
                    ]
                },
                {
                    id: 2,
                    color: "#338122",
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
                    color: "",
                    highlightContent: "Onen i-Estel Edain, ú-chebin estel anim.",
                    highlightNote: "What a beautiful line by Tolkien",
                    flashcards: [
                        {
                            "isDue": true,
                            "note": null,
                            "questionText": " i-Estel Edain, ú-chebin estel anim.",
                            "answerText": "Onen",
                            "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.\n<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
                            "context": "",
                            "cardType": 4,
                            "siblings": [],
                            "clozeInsertionAt": 0,
                            "interval": 2,
                            "ease": 230,
                            "delayBeforeReview": 17662032301
                        }
                    ]
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