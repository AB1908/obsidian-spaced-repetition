import {parseFileText} from "src/data/parser";
import {CardType} from "src/scheduler/scheduling";
import {generateTree} from "src/data/models/bookTree";
import {getFileContents} from "src/data/import/disk";
import {annotation} from "src/data/import/annotations";
import {Heading} from "src/data/models/book";

jest.mock('../src/data/import/disk.ts');
jest.mock('nanoid', () => ({
    nanoid: (number: number) => "aaaaaaaa"
}))

jest.mock('../src/main', () => {
        return {
            plugin: {
                data: {
                    settings: {
                        "baseEase": 250,
                        "lapsesIntervalChange": 0.5,
                        "easyBonus": 1.3,
                        "maximumInterval": 36525,
                    }
                }
            }
        }
    }
)

describe("generateTree", () => {
    test("should nest a paragraph within previous heading", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
        ] as (annotation | Heading)[];
        expect(generateTree(input)).toStrictEqual([
            {
                heading: "Heading 1",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                ],
            },
        ]);
    });

    test("should nest each paragraph in each heading", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "Heading 2",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
        ] as (annotation | Heading)[];
        expect(generateTree(input)).toStrictEqual([
            {
                heading: "Heading 1",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                ],
            },
            {
                heading: "Heading 2",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                ],
            },
        ]);
    });

    test("should nest the subheading in the heading", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 1",
                level: 2,
                children: []
            },
            {
                type: "paragraph",
            },
        ] as (annotation | Heading)[];
        expect(generateTree(input)).toStrictEqual([
            {
                heading: "Heading 1",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                    {
                        heading: "SubHeading 1",
                        level: 2,
                        children: [
                            {
                                type: "paragraph",
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    test("should nest both subheadings under the same heading", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 1",
                level: 2,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 2",
                level: 2,
                children: []
            },
            {
                type: "paragraph",
            },
        ];
        expect(generateTree(input as (annotation | Heading)[])).toStrictEqual([
            {
                heading: "Heading 1",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                    {
                        heading: "SubHeading 1",
                        level: 2,
                        children: [
                            {
                                type: "paragraph",
                            },
                        ],
                    },
                    {
                        heading: "SubHeading 2",
                        level: 2,
                        children: [
                            {
                                type: "paragraph",
                            },
                        ],
                    },
                ],
            },
        ]);
    });

    test("should nest subheadings correctly and return only headings", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 1",
                level: 2,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 2",
                level: 2,
                children: []
            },
            {
                type: "paragraph",
            },
            {
                heading: "Heading 2",
                level: 1,
                children: []
            },
            {
                type: "paragraph",
            },
        ] as (annotation | Heading)[];
        expect(generateTree(input)).toStrictEqual([
            {
                heading: "Heading 1",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                    {
                        heading: "SubHeading 1",
                        level: 2,
                        children: [
                            {
                                type: "paragraph",
                            },
                        ],
                    },
                    {
                        heading: "SubHeading 2",
                        level: 2,
                        children: [
                            {
                                type: "paragraph",
                            },
                        ],
                    },
                ],
            },
            {
                heading: "Heading 2",
                level: 1,
                children: [
                    {
                        type: "paragraph",
                    },
                ],
            },
        ]);
    });
});


describe("parseFlashcard", () => {
    test("parses a flashcard with only annotation id", async () => {
        const flashcard = `This is a question\n?\nThis is an answer\n<!--SR:93813-->`;
        jest.mocked(getFileContents).mockImplementation(async (path: string) => {
            return flashcard
        });
        expect(await parseFileText("sample path")).toEqual([{
            id: "aaaaaaaa",
            notePath: "sample path",
            cardText: "This is a question\n?\nThis is an answer",
            metadataText: "<!--SR:93813-->",
            lineNo: -1,
            cardType: CardType.MultiLineBasic,
        }]);
    });
    test("parses a flashcard with full metadata", async () => {
        const flashcard = `This is a question\n?\nThis is an answer\n<!--SR:93813!L,2021-04-05,99,270-->`;
        jest.mocked(getFileContents).mockImplementation(async (path: string) => {
            return flashcard
        });
        expect(await parseFileText("sample path")).toEqual([{
            id: "aaaaaaaa",
            notePath: "sample path",
            cardText: "This is a question\n?\nThis is an answer",
            metadataText: "<!--SR:93813!L,2021-04-05,99,270-->",
            lineNo: -1,
            cardType: CardType.MultiLineBasic,
        }]);
    });
    test.todo("parses multiple flashcards");
});
