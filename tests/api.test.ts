import {getFlashcardById} from "src/controller";

test("retrieves a flashcard successfully", () => {
   const flashcard = {
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
   };
   expect(getFlashcardById("yjlML2s9W")).toStrictEqual(flashcard);
});