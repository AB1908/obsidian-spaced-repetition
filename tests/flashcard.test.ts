import vals from "./test.json";
import fileReplacement from "./test2.json";
import {
    generateSchedulingArray,
    generateSeparator,
    removeSchedTextFromCard,
    updateCardInFileText,
    updateCardText
} from "src/sched-utils";
import {Card} from "src/Card";

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

test("generateSeparator when new codeblock card", () => {
    const {cardText, isCardCommentOnSameLine} = {"cardText":"codeblock question\n?\n```\ncodeblock answer\n```","isCardCommentOnSameLine":false};
    expect(generateSeparator(cardText, isCardCommentOnSameLine)).toEqual("\n")
})

test("generateSeparator when old codeblock card", () => {
    const {cardText, isCardCommentOnSameLine} = {"cardText":"codeblock question\n?\n```\ncodeblock answer\n```\n<!--SR:!2022-10-10,4,270-->","isCardCommentOnSameLine":false};
    expect(generateSeparator(cardText, isCardCommentOnSameLine)).toEqual("\n")
})

describe("updateCardText", () => {
    test("when it contains previously seen flashcard with codeblock", () => {
        // @ts-ignore
        const {dueString, interval, ease, currentCard, isCardCommentOnSameLine} = {"currentCard":{"isDue":true,"note":{"deleted":false,"vault":{},"path":"FIlename.md","name":"FIlename.md","basename":"FIlename","extension":"md","saving":false,"stat":{"ctime":1661948183322,"mtime":1667710751627,"size":825},"parent":{}},"lineNo":44,"front":"codeblock question","back":"```\ncodeblock answer\n```\n<!--SR:!2022-10-10,4,270-->","cardText":"codeblock question\n?\n```\ncodeblock answer\n```\n<!--SR:!2022-10-10,4,270-->","context":"New deck top level > This is a context header","cardType":2,"siblingIdx":0,"siblings":[],"interval":4,"ease":270,"delayBeforeReview":2370604139},"dueString":"2023-03-03","interval":117,"ease":290,"isCardCommentOnSameLine":false};

        expect(updateCardText(currentCard as unknown as Card, dueString, interval, ease, isCardCommentOnSameLine)).toEqual("codeblock question\n?\n```\ncodeblock answer\n```\n<!--SR:!2023-03-03,117,290-->"
        );
    });

    test("when it contains new flashcard with codeblock", () => {
        // @ts-ignore
        const {dueString, interval, ease, currentCard, isCardCommentOnSameLine} = {"currentCard":{"isDue":false,"note":{"deleted":false,"vault":{},"path":"FIlename.md","name":"FIlename.md","basename":"FIlename","extension":"md","saving":false,"stat":{"ctime":1661948183322,"mtime":1667711180374,"size":797},"parent":{}},"lineNo":44,"front":"codeblock question","back":"```\ncodeblock answer\n```","cardText":"codeblock question\n?\n```\ncodeblock answer\n```","context":"New deck top level > This is a context header","cardType":2,"siblingIdx":0,"siblings":[]},"dueString":"2022-11-10","interval":4,"ease":270,"isCardCommentOnSameLine":false};

        expect(updateCardText(currentCard as unknown as Card, dueString, interval, ease, isCardCommentOnSameLine)).toEqual("codeblock question\n?\n```\ncodeblock answer\n```\n<!--SR:!2022-11-10,4,270-->");
    });
});

test("removal", () => {
    expect(removeSchedTextFromCard("codeblock question\n?\n```\ncodeblock answer\n```\n<!--SR:!2022-11-10,4,270-->", "\n")).toEqual("codeblock question\n?\n```\ncodeblock answer\n```");
})

test("removal", () => {
    expect(removeSchedTextFromCard("codeblock question\n?\n```\ncodeblock answer\n```\n<!--SR:!2022-11-10,4,270-->", "\n")).toEqual("codeblock question\n?\n```\ncodeblock answer\n```");
})
