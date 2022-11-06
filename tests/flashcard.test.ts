import vals from "./test.json";
import {Card} from "src/scheduling";
import {generateSchedulingArray} from "src/sched-utils";

test("initial", () => {
    const {cardText, dueString, interval, ease, currentCard} = vals;
    expect(generateSchedulingArray(cardText, dueString, interval, ease, currentCard as unknown as Card)).toEqual([["0","2023-03-06","120","250"]]);
});