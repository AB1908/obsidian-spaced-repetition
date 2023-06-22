// TODO: decks need to not be coupled directly to the file contents, those should be separate
// TODO: decide what unique key that a deck

const flashcards = [
    {
        "id": "ks991kna",
        "note": null,
        "questionText": " i-Estel Edain, ú-chebin estel anim.",
        "answerText": "Onen",
        "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.",
        "metadataText": "<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
        "context": "",
        "cardType": 4,
        "siblings": ["ks991kw1"],
        "clozeInsertionAt": 0,
        "interval": 2,
        "ease": 230,
        "delayBeforeReview": 17662032301
    },
    {
        "id": "ks991kw1",
        "note": null,
        "questionText": "Onen i-Estel Edain,  estel anim.",
        "answerText": "ú-chebin",
        "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.",
        "metadataText": "<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
        "context": "",
        "cardType": 4,
        "siblings": ["ks991kna"],
        "clozeInsertionAt": 19,
        "interval": 2,
        "ease": 210,
        "delayBeforeReview": 17662032301
    }
]

const highlights = [
    {
        id: "d91maa3h",
        color: "#339122",
        highlightContent: "Onen i-Estel Edain, ú-chebin estel anim.",
        highlightNote: "What a beautiful line by Tolkien",
        flashcards: [
            "ks991kna",
        ]
    },
    {
        id: "d91ms7d",
        color: "#338122",
        highlightContent: "This is a sample highlight but without a note",
        //TODO: think about whether this should be a null or an empty string on the backend
        highlightNote: "",
        flashcards: []
    },
    {
        id: "9dk1m3jg",
        color: "#338122",
        highlightContent: "This is a sample highlight but without a note but also in chapter 1",
        //TODO: think about whether this should be a null or an empty string on the backend
        highlightNote: "",
        flashcards: []
    }
]

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
                "9dk1m3jg",
            ],
        },
        {
            id: 2,
            title: "Chapter 2",
            highlights: [
                "d91maa3h",
                "d91ms7d",
            ],
        },
    ]
};