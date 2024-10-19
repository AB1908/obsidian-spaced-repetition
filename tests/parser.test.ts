import { extractParsedCards, parseFileText } from "src/data/parser";
import { CardType } from "src/scheduler/scheduling";
import { generateTree } from "src/data/models/bookTree";
import { Heading } from "src/data/models/sourceNote";

jest.mock("../src/data/disk");

jest.mock("../src/main", () => {
    return {
        plugin: {
            data: {
                settings: {
                    baseEase: 250,
                    lapsesIntervalChange: 0.5,
                    easyBonus: 1.3,
                    maximumInterval: 36525,
                },
            },
        },
    };
});

describe("generateTree", () => {
    test("should nest a paragraph within previous name", () => {
        const input = [
            {
                name: "Heading 1",
                level: 1,
                children: [],
            },
        ] as unknown as Heading[];
        expect(generateTree(input)).toMatchInlineSnapshot(`
            [
              {
                "children": [],
                "level": 1,
                "name": "Heading 1",
              },
            ]
        `);
    });

    test("should nest each paragraph in each name", () => {
        const input = [
            {
                name: "Heading 1",
                level: 1,
                children: [],
            },
            {
                name: "Heading 2",
                level: 1,
                children: [],
            },
        ] as unknown as Heading[];
        expect(generateTree(input)).toMatchInlineSnapshot(`
            [
              {
                "children": [],
                "level": 1,
                "name": "Heading 1",
              },
              {
                "children": [],
                "level": 1,
                "name": "Heading 2",
              },
            ]
        `);
    });

    test("should nest the subname in the name", () => {
        const input = [
            {
                name: "Heading 1",
                level: 1,
                children: [],
            },
            {
                name: "SubHeading 1",
                level: 2,
                children: [],
            },
        ] as unknown as Heading[];
        expect(generateTree(input)).toMatchInlineSnapshot(`
            [
              {
                "children": [
                  {
                    "children": [],
                    "level": 2,
                    "name": "SubHeading 1",
                  },
                ],
                "level": 1,
                "name": "Heading 1",
              },
            ]
        `);
    });

    test("should nest both subnames under the same name", () => {
        const input = [
            {
                name: "Heading 1",
                level: 1,
                children: [],
            },
            {
                name: "SubHeading 1",
                level: 2,
                children: [],
            },
            {
                name: "SubHeading 2",
                level: 2,
                children: [],
            },
        ] as unknown as Heading[];
        expect(generateTree(input)).toMatchInlineSnapshot(`
            [
              {
                "children": [
                  {
                    "children": [],
                    "level": 2,
                    "name": "SubHeading 1",
                  },
                  {
                    "children": [],
                    "level": 2,
                    "name": "SubHeading 2",
                  },
                ],
                "level": 1,
                "name": "Heading 1",
              },
            ]
        `);
    });

    test("should nest subnames correctly and return only names", () => {
        const input = [
            {
                name: "Heading 1",
                level: 1,
                children: [],
            },
            {
                name: "SubHeading 1",
                level: 2,
                children: [],
            },
            {
                name: "SubHeading 2",
                level: 2,
                children: [],
            },
            {
                name: "Heading 2",
                level: 1,
                children: [],
            },
        ] as unknown as Heading[];
        expect(generateTree(input)).toMatchInlineSnapshot(`
            [
              {
                "children": [
                  {
                    "children": [],
                    "level": 2,
                    "name": "SubHeading 1",
                  },
                  {
                    "children": [],
                    "level": 2,
                    "name": "SubHeading 2",
                  },
                ],
                "level": 1,
                "name": "Heading 1",
              },
              {
                "children": [],
                "level": 1,
                "name": "Heading 2",
              },
            ]
        `);
    });
});

describe("extractParsedCards", () => {
    beforeEach(async () => {
        // todo: fix ts error
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
    });
    test("parses a flashcard with only annotation id", () => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expect(
            extractParsedCards(
                "This is a question\n?\nThis is an answer\n<!--SR:93813-->",
                "sample path"
            )
        ).toEqual([
            {
                id: "0",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
        ]);
    });
    test("parses a flashcard with full metadata", async () => {
        const flashcard =
            "This is a question\n?\nThis is an answer\n<!--SR:93813!L,2021-04-05,99,270-->";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        expect(extractParsedCards(flashcard, "sample path")).toEqual([
            {
                id: "0",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813!L,2021-04-05,99,270-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
        ]);
    });
    // todo: rethink this
    // not required if I test it with actual file contents
    test.skip("parses multiple flashcards", () => {});

    afterEach(() => {
        jest.resetAllMocks();
    });
});

describe("parseFileText", () => {
    beforeEach(async () => {
        // todo: fix ts error
        const nanoid = require("nanoid");
        let value = 0;
        nanoid.nanoid.mockImplementation((_size?: number) => (value++).toString());
    });
    test("generates an array of multiple flashcards given file text", async () => {
        expect(await parseFileText("Untitled - Flashcards.md")).toMatchInlineSnapshot(`
            [
              {
                "cardText": "ryder
            ?
            homie",
                "cardType": 2,
                "id": "0",
                "lineNo": -1,
                "metadataText": "<!--SR:hjhjhlkap-->",
                "notePath": "Untitled - Flashcards.md",
              },
              {
                "cardText": "asfsf
            ?
            324",
                "cardType": 2,
                "id": "1",
                "lineNo": -1,
                "metadataText": "<!--SR:hjhjhlkap!L,2024-03-20,3,250-->",
                "notePath": "Untitled - Flashcards.md",
              },
              {
                "cardText": "New
            ?
            Card not",
                "cardType": 2,
                "id": "2",
                "lineNo": -1,
                "metadataText": "<!--SR:hjhjhlkap-->",
                "notePath": "Untitled - Flashcards.md",
              },
              {
                "cardText": "new
            ?
            question",
                "cardType": 2,
                "id": "3",
                "lineNo": -1,
                "metadataText": "<!--SR:tmi3ktJd-->",
                "notePath": "Untitled - Flashcards.md",
              },
            ]
        `);
    });
    afterEach(() => {
        jest.resetAllMocks();
    });
});
