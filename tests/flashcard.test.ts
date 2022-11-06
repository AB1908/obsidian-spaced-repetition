import vals from "./test.json";
import fileReplacement from "./test2.json";
import {Card} from "src/scheduling";
import {generateSchedulingArray, updateCardInFileText, updateCardText} from "src/sched-utils";

test("initial", () => {
    const {cardText, dueString, interval, ease, currentCard} = vals;
    expect(generateSchedulingArray(cardText, dueString, interval, ease, currentCard as unknown as Card)).toEqual([["0","2023-03-06","120","250"]]);
});

test("updateCardText", () => {
    const {cardText, dueString, interval, ease, currentCard} = vals;
    expect(updateCardText(currentCard as unknown as Card, dueString, interval, ease, false)).toEqual('newdeck question 5\n?\nAnswer that was edited on 2022-10-31\n<!--SR:!2023-03-06,120,250-->');
});

test("updateCardTextInFile", () => {
    const {cardText, fileText, currentCard} = fileReplacement;
    expect(updateCardInFileText(currentCard as unknown as Card, fileText, cardText)).toEqual('#flashcards/newdeck\n\n# New deck top level\n\nnewdeck question 5\n?\nAnswer that was edited on 2022-10-31\n\x3C!--SR:!2023-03-06,120,250-->\n\nnewdeckquestion6::text\n\x3C!--SR:!2022-11-07,1,230-->\n\nnewdeckquestion7 ==things==\n\x3C!--SR:!2022-11-26,26,250-->\n\n## This is a context header\n\nnewdeck question under context header\n?\nwith an answer\n\x3C!--SR:!2022-12-30,60,290-->');
});
