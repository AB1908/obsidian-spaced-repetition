import { bookSections, findNextHeader, findPreviousHeader } from "src/data/models/book";
import { beforeEach } from "@jest/globals";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
import type { SectionCache } from "obsidian";
import type { Flashcard } from "src/data/models/flashcard";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {
});

test("bookSections", () => {
    const flashcards = [
        {
            "annotationId": "93813",
            "answerText": "This is an answer",
            "cardType": 2,
            "context": null,
            "dueDate": null,
            "ease": null,
            "flag": null,
            "id": "b4cYyMuF",
            "interval": null,
            "parsedCardId": "aaaaaaaa",
            "questionText": "This is a question",
            "siblings": []
        }
    ];
    expect(bookSections(sampleAnnotationMetadata, sampleAnnotationText, flashcards as unknown as Flashcard[])).toMatchSnapshot();
});

let input: SectionCache[];

const sectionsGenerator = () => [
    {
        heading: "Heading 1",
        level: 1
    },
    {
        type: "paragraph"
    },
    {
        heading: "SubHeading 1",
        level: 2
    },
    {
        type: "paragraph"
    },
    {
        heading: "SubHeading 2",
        level: 2
    },
    {
        type: "paragraph"
    },
    {
        heading: "Heading 2",
        level: 1
    },
    {
        type: "paragraph"
    }
];
describe("findPreviousHeader", () => {
    beforeEach(() => {
        input = sectionsGenerator() as SectionCache[];
    });

    test("should return null for a top level header", () => {
        expect(findPreviousHeader(input[6] as SectionCache, input as SectionCache[])).toBe(-1);
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
        expect(findPreviousHeader(input[6] as SectionCache, input as SectionCache[])).toBe(-1);
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
                level: 1
            },
            {
                type: "paragraph"
            },
            {
                heading: "SubHeading 1",
                level: 2
            },
            {
                type: "paragraph"
            },
            {
                heading: "SubHeading 2",
                level: 2
            },
            {
                type: "paragraph"
            },
            {
                heading: "Heading 2",
                level: 1
            },
            {
                type: "paragraph"
            }
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
