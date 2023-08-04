import {
    bookSections, findNextHeader,
    findPreviousHeader,
    getAnnotationsForSection,
    Heading
} from "src/data/models/book";
import {sampleAnnotationMetadata, sampleAnnotationText} from "./disk.test";
import {annotation} from "src/data/import/annotations";
import {bookWithCounts} from "src/api";
import {beforeEach} from "@jest/globals";
import {HeadingCache, SectionCache} from "obsidian";
import {AnnotationCount, generateTree} from "src/data/models/bookTree";

const { nanoid } = jest.requireActual("nanoid");
jest.doMock("nanoid", () => ({
    nanoid: nanoid,
}));
jest.mock("../src/main", () => {});

let bookSectionsArray = [
    {
        display: "Header 1",
        heading: "Header 1",
        id: "-g4c-q2S",
        level: 1,
    },
    {
        highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
        id: 93813,
        note: ">",
        type: "notes",
    },
    {
        display: "SubHeader 1",
        heading: "SubHeader 1",
        id: "xHev-sAx",
        level: 2,
    },
    {
        highlight: "> Onen i estel Edain, u-chebin estel anim.",
        id: 93813,
        note: "> What a beautiful line by Tolkien",
        type: "notes",
    },
    {
        display: "SubHeader 2",
        heading: "SubHeader 2",
        id: "xHev-sA1",
        level: 2,
    },
    {
        highlight: "> Onen i estel Edain, u-chebin estel anim.",
        id: 93813,
        note: "> What a beautiful line by Tolkien 2",
        type: "notes",
    },
    {
        display: "Header 2",
        heading: "Header 2",
        id: "eLy47ZoN",
        level: 1,
    },
    {
        highlight: "> Onen i estel Edain, u-chebin estel anim.",
        id: 93813,
        note: "> What a beautiful line by Tolkien\n> This is another line.",
        type: "notes",
    },
    {
        display: "Last header",
        heading: "Last header",
        id: "WVcwnuIQ",
        level: 1,
    },
    {
        highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
        id: 93813,
        note: "> What a beautiful line by Tolkien",
        type: "notes",
    },
    {
        display: "Last subheader",
        heading: "Last subheader",
        id: "WVc23uIQ",
        level: 2,
    },
    {
        highlight: "> New highlight here.\n> This is another line.",
        id: 93813,
        note: "> Test",
        type: "notes",
    },
] as (annotation | Heading)[];

test("generate tree with flashcard information", () => {
    // expect()
    let flashcards = [
        {
            display: "Header 1",
            heading: "Header 1",
            id: "-g4c-q2S",
            level: 1,
        },
        {
            highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
            id: 93813,
            note: ">",
            type: "notes",
            hasFlashcards: true,
        },
        {
            display: "SubHeader 1",
            heading: "SubHeader 1",
            id: "xHev-sAx",
            level: 2,
        },
        {
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            id: 93813,
            note: "> What a beautiful line by Tolkien",
            type: "notes",
            hasFlashcards: false,
        },
        {
            display: "SubHeader 2",
            heading: "SubHeader 2",
            id: "xHev-sA1",
            level: 2,
        },
        {
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            id: 93813,
            note: "> What a beautiful line by Tolkien 2",
            type: "notes",
            hasFlashcards: false,
        },
        {
            display: "Header 2",
            heading: "Header 2",
            id: "eLy47ZoN",
            level: 1,
        },
        {
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            id: 93813,
            note: "> What a beautiful line by Tolkien\n> This is another line.",
            type: "notes",
            hasFlashcards: false,
        },
        {
            display: "Last header",
            heading: "Last header",
            id: "WVcwnuIQ",
            level: 1,
        },
        {
            highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
            id: 93813,
            note: "> What a beautiful line by Tolkien",
            type: "notes",
            hasFlashcards: true,
        },
        {
            display: "Last subheader",
            heading: "Last subheader",
            id: "WVc23uIQ",
            level: 2,
        },
        {
            highlight: "> New highlight here.\n> This is another line.",
            id: 93813,
            note: "> Test",
            type: "notes",
            hasFlashcards: false,
        },
    ] as (annotation | Heading)[];

    let output = [
        {
            display: "Header 1",
            heading: "Header 1",
            id: "-g4c-q2S",
            level: 1,
            children: [
                {
                    highlight:
                        "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                    id: 93813,
                    note: ">",
                    type: "notes",
                    hasFlashcards: true,
                },
                {
                    display: "SubHeader 1",
                    heading: "SubHeader 1",
                    id: "xHev-sAx",
                    level: 2,
                    children: [
                        {
                            highlight: "> Onen i estel Edain, u-chebin estel anim.",
                            id: 93813,
                            note: "> What a beautiful line by Tolkien",
                            type: "notes",
                            hasFlashcards: false,
                        },
                    ],
                },
                {
                    display: "SubHeader 2",
                    heading: "SubHeader 2",
                    id: "xHev-sA1",
                    level: 2,
                    children: [
                        {
                            highlight: "> Onen i estel Edain, u-chebin estel anim.",
                            id: 93813,
                            note: "> What a beautiful line by Tolkien 2",
                            type: "notes",
                            hasFlashcards: false,
                        },
                    ],
                },
            ],
        },
        {
            display: "Header 2",
            heading: "Header 2",
            id: "eLy47ZoN",
            level: 1,
            children: [
                {
                    highlight: "> Onen i estel Edain, u-chebin estel anim.",
                    id: 93813,
                    note: "> What a beautiful line by Tolkien\n> This is another line.",
                    type: "notes",
                    hasFlashcards: false,
                },
            ],
        },
        {
            display: "Last header",
            heading: "Last header",
            id: "WVcwnuIQ",
            level: 1,
            children: [
                {
                    highlight:
                        "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                    id: 93813,
                    note: "> What a beautiful line by Tolkien",
                    type: "notes",
                    hasFlashcards: true,
                },
                {
                    display: "Last subheader",
                    heading: "Last subheader",
                    id: "WVc23uIQ",
                    level: 2,
                    children: [
                        {
                            highlight: "> New highlight here.\n> This is another line.",
                            id: 93813,
                            note: "> Test",
                            type: "notes",
                            hasFlashcards: false,
                        },
                    ],
                },
            ],
        },
    ];
    expect(generateTree(flashcards)).toEqual(output);
});

test("recursive counter", () => {
    expect(AnnotationCount(bookWithCounts)).toMatchInlineSnapshot(`
        {
          "-g4c-q2S": {
            "with": 1,
            "without": 2,
          },
          "WVc23uIQ": {
            "with": 0,
            "without": 1,
          },
          "WVcwnuIQ": {
            "with": 1,
            "without": 1,
          },
          "alksdfj9": {
            "with": 2,
            "without": 4,
          },
          "eLy47ZoN": {
            "with": 0,
            "without": 1,
          },
          "xHev-sA1": {
            "with": 0,
            "without": 1,
          },
          "xHev-sAx": {
            "with": 0,
            "without": 1,
          },
        }
    `);
});

test("bookSections", () => {
    expect(bookSections(sampleAnnotationMetadata, sampleAnnotationText)).toMatchSnapshot();
});

describe("getAnnotations", () => {
    test("successfully gets nested annotations", () => {
        expect(getAnnotationsForSection("-g4c-q2S", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                id: 93813,
                note: ">",
                type: "notes",
            },
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes",
            },
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien 2",
                type: "notes",
            },
        ]);
    });

    test("successfully gets annotations from subsection", () => {
        expect(getAnnotationsForSection("xHev-sAx", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes",
            },
        ]);
    });

    test("gets annotations from first subheader under heading 1", () => {
        expect(getAnnotationsForSection("xHev-sAx", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes",
            },
        ]);
    });

    test("gets annotations from second subheader under heading 1", () => {
        expect(getAnnotationsForSection("xHev-sA1", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien 2",
                type: "notes",
            },
        ]);
    });

    test("gets all nested annotations under last header", () => {
        expect(getAnnotationsForSection("WVcwnuIQ", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes",
            },
            {
                highlight: "> New highlight here.\n> This is another line.",
                id: 93813,
                note: "> Test",
                type: "notes",
            },
        ]);
    });

    test("gets all nested annotations under last subheader", () => {
        expect(getAnnotationsForSection("WVc23uIQ", bookSectionsArray)).toEqual([
            {
                highlight: "> New highlight here.\n> This is another line.",
                id: 93813,
                note: "> Test",
                type: "notes",
            },
        ]);
    });
});

let input: any[];
describe("findPreviousHeader", () => {
    beforeEach(() => {
        input = [
            {
                heading: "Heading 1",
                level: 1,
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 1",
                level: 2,
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 2",
                level: 2,
            },
            {
                type: "paragraph",
            },
            {
                heading: "Heading 2",
                level: 1,
            },
            {
                type: "paragraph",
            },
        ];
    });

    test("should return null for a top level header", () => {
        expect(findPreviousHeader(input as SectionCache[], input[6] as SectionCache)).toBe(null);
        expect(findPreviousHeader(input as SectionCache[], input[0] as SectionCache)).toBe(null);
    });
    test("should return a top level header for a subheader", () => {
        expect(findPreviousHeader(input as SectionCache[], input[4] as SectionCache)).toBe(0);
        expect(findPreviousHeader(input as SectionCache[], input[2] as SectionCache)).toBe(0);
    });
    // TODO: test for subsubheaders :(
    test("should return a top level header for an annotation under it", () => {
        expect(findPreviousHeader(input as SectionCache[], input[1] as SectionCache)).toBe(0);
    });
    test("should return a top level header for an annotation under it", () => {
        expect(findPreviousHeader(input as SectionCache[], input[3] as SectionCache)).toBe(2);
    });
});

describe("generateHeaderCounts", () => {
    beforeEach(() => {
        input = [
            {
                heading: "Heading 1",
                level: 1,
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 1",
                level: 2,
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 2",
                level: 2,
            },
            {
                type: "paragraph",
            },
            {
                heading: "Heading 2",
                level: 1,
            },
            {
                type: "paragraph",
            },
        ];
    });

    test("should return null for a top level header", () => {
        expect(findPreviousHeader(input as SectionCache[], input[6] as SectionCache)).toBe(null);
        expect(findPreviousHeader(input as SectionCache[], input[0] as SectionCache)).toBe(null);
    });
    // test("should return a top level header for a subheader", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[4] as SectionCache)).toBe(0);
    //     expect(findPreviousHeader(input as SectionCache[], input[2] as SectionCache)).toBe(0);
    // });
    // // TODO: test for subsubheaders :(
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[1] as SectionCache)).toBe(0);
    // });
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[3] as SectionCache)).toBe(2);
    // });
});

describe("findNextHeader", () => {
    beforeEach(() => {
        input = [
            {
                heading: "Heading 1",
                level: 1,
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 1",
                level: 2,
            },
            {
                type: "paragraph",
            },
            {
                heading: "SubHeading 2",
                level: 2,
            },
            {
                type: "paragraph",
            },
            {
                heading: "Heading 2",
                level: 1,
            },
            {
                type: "paragraph",
            },
        ];
    });

    test("should return null for a top level header", () => {
        expect(findNextHeader(input as SectionCache[], input[6] as HeadingCache)).toBe(8);
        expect(findNextHeader(input as SectionCache[], input[0] as HeadingCache)).toBe(6);
    });
    test("should return a top level header for a subheader", () => {
        expect(findNextHeader(input as SectionCache[], input[4] as HeadingCache)).toBe(6);
        expect(findNextHeader(input as SectionCache[], input[2] as HeadingCache)).toBe(4);
    });
    // // TODO: test for subsubheaders :(
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[1] as SectionCache)).toBe(0);
    // });
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[3] as SectionCache)).toBe(2);
    // });
});
