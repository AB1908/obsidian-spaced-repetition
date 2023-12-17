import { bookSections, findNextHeader, findPreviousHeader } from "src/data/models/sourceNote";
import { beforeEach } from "@jest/globals";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
import type { SectionCache } from "obsidian";
import type { Flashcard } from "src/data/models/flashcard";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {
});

test.skip("bookSections", () => {
    const flashcards = [
        {
            annotationId: "93813",
            answerText: "This is an answer",
            cardType: 2,
            context: null,
            dueDate: null,
            ease: null,
            flag: null,
            id: "b4cYyMuF",
            interval: null,
            parsedCardId: "aaaaaaaa",
            questionText: "This is a question",
            siblings: [],
        },
    ];
    expect(
        bookSections(
            sampleAnnotationMetadata,
            sampleAnnotationText,
            flashcards as unknown as Flashcard[]
        )
    ).toMatchSnapshot();
});

let input: SectionCache[];

const sectionsGenerator = () => [
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
        heading: "SubsubHeading 1",
        level: 3,
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
describe("findPreviousHeader", () => {
    beforeEach(() => {
        input = sectionsGenerator() as SectionCache[];
    });

    test("should return null for a top level header", () => {
        expect(findPreviousHeader(input[6] as SectionCache, input as SectionCache[])).toBe(4);
        expect(findPreviousHeader(input[0] as SectionCache, input as SectionCache[])).toBe(-1);
    });
    test("should return a top level header for a subheader", () => {
        expect(findPreviousHeader(input[4] as SectionCache, input as SectionCache[])).toBe(0);
        expect(findPreviousHeader(input[2] as SectionCache, input as SectionCache[])).toBe(0);
    });
    // TODO: test for subsubheaders :(
    test("should return a top level header for an annotation under it", () => {
        expect(findPreviousHeader(input[1] as SectionCache, input as SectionCache[])).toBe(0);
    });
    test("should return a sub header for an annotation under it", () => {
        expect(findPreviousHeader(input[3] as SectionCache, input as SectionCache[])).toBe(2);
    });
});

describe("generateHeaderCounts", () => {
    beforeEach(() => {
        input = sectionsGenerator() as unknown as SectionCache[];
    });

    test("should return null for a top level header", () => {
        expect(findPreviousHeader(input[6] as SectionCache, input as SectionCache[])).toBe(4);
        expect(findPreviousHeader(input[0] as SectionCache, input as SectionCache[])).toBe(-1);
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

let inputHeadingCache: SectionCache[];

describe("findNextHeader", () => {
    beforeEach(() => {
        inputHeadingCache = [
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
        ] as SectionCache[];
    });

    test("should return null for a top level header", () => {
        expect(findNextHeader(inputHeadingCache[6], inputHeadingCache as SectionCache[])).toBe(-1);
        expect(findNextHeader(inputHeadingCache[0], inputHeadingCache as SectionCache[])).toBe(6);
    });
    test("should return a top level header for a subheader", () => {
        expect(findNextHeader(inputHeadingCache[4], inputHeadingCache as SectionCache[])).toBe(6);
        expect(findNextHeader(inputHeadingCache[2], inputHeadingCache as SectionCache[])).toBe(4);
    });
    // // TODO: test for subsubheaders :(
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[1] as SectionCache)).toBe(0);
    // });
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[3] as SectionCache)).toBe(2);
    // });
});

describe("booktree", () => {
    test("should return correctly nested header", () => {
        const input = [
            {
                name: "Chapter 4: Inaccuracies in memory",
                level: 1,
                id: "EwZRTUMA",
                children: [],
                counts: {
                    with: 5,
                    without: 57,
                },
            },
            {
                name: "Forgetting",
                level: 2,
                id: "TiN6TJ1w",
                children: [],
                counts: {
                    with: 3,
                    without: 3,
                },
            },
            {
                name: "Flashbulb memories and the reminiscence bump",
                level: 2,
                id: "SyVdO7dG",
                children: [],
                counts: {
                    with: 2,
                    without: 3,
                },
            },
            {
                name: "Organization and errors in memory",
                level: 2,
                id: "mv85CY7E",
                children: [],
                counts: {
                    with: 0,
                    without: 4,
                },
            },
            {
                name: "The effects of previous knowledge",
                level: 2,
                id: "jA7JYKN7",
                children: [],
                counts: {
                    with: 0,
                    without: 42,
                },
            },
            {
                name: "Schemas – what we already know:",
                level: 3,
                id: "6khBO7fB",
                children: [],
                counts: {
                    with: 0,
                    without: 15,
                },
            },
            {
                name: "How does knowledge promote remembering?",
                level: 3,
                id: "EeKBgd8u",
                children: [],
                counts: {
                    with: 0,
                    without: 2,
                },
            },
            {
                name: "How can knowledge lead to errors?",
                level: 3,
                id: "2qSp19X8",
                children: [],
                counts: {
                    with: 0,
                    without: 25,
                },
            },
            {
                name: "Real versus imagined memories",
                level: 2,
                id: "UMwPwxsy",
                children: [],
                counts: {
                    with: 0,
                    without: 21,
                },
            },
            {
                name: "Reality monitoring",
                level: 3,
                id: "RT9ZKLEm",
                children: [],
                counts: {
                    with: 0,
                    without: 5,
                },
            },
            {
                name: "Eyewitness testimony",
                level: 3,
                id: "g24te0Y6",
                children: [],
                counts: {
                    with: 0,
                    without: 15,
                },
            },
            {
                name: "The misinformation effect",
                level: 2,
                id: "7ETt7qTC",
                children: [],
                counts: {
                    with: 0,
                    without: 11,
                },
            },
            {
                name: "False memories:",
                level: 3,
                id: "_mjFRvuJ",
                children: [],
                counts: {
                    with: 0,
                    without: 8,
                },
            },
        ];
        expect(findPreviousHeader(input[8], input)).toBe(0);
    });
});
