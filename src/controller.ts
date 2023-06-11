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
    },
    {
        "id": "isf92c",
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
    },
    {
        "id": "aaalkdfa9a",
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
    },
];

export function getFlashcardById(id: string) {
    return flashcards.filter(t=>t.id===id)[0] ?? null;
}