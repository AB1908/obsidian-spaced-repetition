import { parseFileText } from "src/data/parser";
import { CardType } from "src/scheduler/scheduling";
import { generateTree } from "src/data/models/bookTree";
import { getFileContents } from "src/data/import/disk";
import { Heading } from "src/data/models/book";

jest.mock("../src/data/import/disk.ts");
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

describe("parseFlashcard", () => {
    test("parses a flashcard with only annotation id", async () => {
        const flashcard = "This is a question\n?\nThis is an answer\n<!--SR:93813-->";
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        jest.mocked(getFileContents).mockImplementation(async (path: string) => {
            return flashcard;
        });
        expect(await parseFileText("sample path")).toEqual([
            {
                id: "aaaaaaaa",
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
        jest.mocked(getFileContents).mockImplementation(async (path: string) => {
            return flashcard;
        });
        expect(await parseFileText("sample path")).toEqual([
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
