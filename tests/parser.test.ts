import { parseFileText } from "src/data/parser";
import { CardType } from "src/types/CardType";
import { generateTree } from "src/data/models/bookTree";
import { Heading } from "src/data/models/AnnotationsNote";
import { getFileContents } from "../src/infrastructure/disk";

jest.mock("../src/infrastructure/disk");
const mockedGetFileContents = getFileContents as jest.Mock;

jest.mock("nanoid", () => ({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    nanoid: (number: number) => "aaaaaaaa",
}));

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

//todo: seems like we're parsing the same thing twice
// fix it to test different types of values and maybe 
// parse a card at a time and then test combos like 
// in the current version
describe("parseFlashcard", () => {
    const flashcardText = "This is a question\n?\nThis is an answer\n<!--SR:93813-->\n\nThis is a question\n?\nThis is an answer\n<!--SR:93813!L,2021-04-05,99,270-->";

    test("parses a flashcard with only annotation id", async () => {
        mockedGetFileContents.mockResolvedValue(flashcardText);
        expect(await parseFileText("sample path")).toEqual([
            {
                id: "aaaaaaaa",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
            { // Added the second flashcard expectation
                id: "aaaaaaaa",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813!L,2021-04-05,99,270-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
        ]);
    });
    test("parses a flashcard with full metadata", async () => {
        mockedGetFileContents.mockResolvedValue(flashcardText);
        expect(await parseFileText("sample path")).toEqual([
            {
                id: "aaaaaaaa",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813-->", // Expected first flashcard
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
            {
                id: "aaaaaaaa",
                notePath: "sample path",
                cardText: "This is a question\n?\nThis is an answer",
                metadataText: "<!--SR:93813!L,2021-04-05,99,270-->",
                lineNo: -1,
                cardType: CardType.MultiLineBasic,
            },
        ]);
    });
    test.todo("parses multiple flashcards");
});
