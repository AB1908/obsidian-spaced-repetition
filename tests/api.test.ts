import {getFlashcardById} from "src/controller";

test("retrieves a flashcard successfully", () => {
   expect(getFlashcardById("yjlML2s9W")).toBe(false);
});