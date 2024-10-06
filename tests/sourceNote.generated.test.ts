import type { SectionCache } from "obsidian";
import { Flashcard } from "src/data/models/flashcard";
import { paragraph } from "src/data/models/paragraphs";
import {
    type BookMetadataSection,
    bookSections,
    findNextHeader,
    findPreviousHeaderForHeading,
    findPreviousHeaderForSection,
    generateFlashcardsFileNameAndPath,
    generateHeaderCounts,
    getAnnotationFilePath,
    type Heading,
    isAnnotation,
    isHeading,
    type RawBookSection,
    SourceNote,
    updateHeaders
} from "src/data/models/sourceNote";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
import { beforeEach } from "@jest/globals";
import { sectionsGenerator } from "./book.test";

jest.mock("obsidian");
jest.mock("nanoid");
jest.mock("src/data/disk");
jest.mock("src/data/models/annotations");
jest.mock("src/data/models/flashcard");
jest.mock("src/data/models/parsedCard");
jest.mock("src/data/models/parsedCard");
jest.mock("src/data/utils/TextGenerator");
jest.mock("src/scheduler/scheduling");
jest.mock("src/scheduler/scheduling");
jest.mock("src/main");
jest.mock("src/main");
jest.mock("src/data/models/paragraphs");
jest.mock("src/api");
jest.mock("src/data/parser");

let inputHeadingCache: SectionCache[];

// describe.skip("SourceNote", () => {
// });

describe.skip("isHeading", () => {
    it("should expose a function", () => {
        expect(isHeading).toBeDefined();
    });

    it("isHeading should return expected output", () => {
        // const retValue = isHeading(section);
        expect(false).toBeTruthy();
    });
});
describe.skip("isAnnotation", () => {
    it("should expose a function", () => {
        expect(isAnnotation).toBeDefined();
    });

    it("isAnnotation should return expected output", () => {
        // const retValue = isAnnotation(section);
        expect(false).toBeTruthy();
    });
});

describe("bookSections", () => {
    it.skip("bookSections should return expected output", () => {
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
                siblings: []
            }
        ];
        expect(
            bookSections(
                sampleAnnotationMetadata,
                sampleAnnotationText,
                flashcards as unknown as Flashcard[]
            )
        ).toMatchSnapshot();
    });
});

describe.skip("findPreviousHeaderForSection", () => {
    it("should expose a function", () => {
        expect(findPreviousHeaderForSection).toBeDefined();
    });

    it("findPreviousHeaderForSection should return expected output", () => {
        // const retValue = findPreviousHeaderForSection(section,sections);
        expect(false).toBeTruthy();
    });
});

let input: (RawBookSection | BookMetadataSection)[];

describe("findPreviousHeaderForHeading", () => {
    it("should expose a function", () => {
        expect(findPreviousHeaderForHeading).toBeDefined();
    });

    beforeEach(() => {
        input = sectionsGenerator() as (RawBookSection | BookMetadataSection)[];
    });

    it("returns null for a top level header", () => {
        expect(findPreviousHeaderForHeading(input[6] as Heading, input as SectionCache[])).toBe(4);
        expect(findPreviousHeaderForHeading(input[0] as Heading, input as SectionCache[])).toBe(-1);
    });

    it("returns a top level header for a subheader", () => {
        expect(findPreviousHeaderForHeading(input[4] as Heading, input as SectionCache[])).toBe(0);
        expect(findPreviousHeaderForHeading(input[2] as Heading, input as SectionCache[])).toBe(0);
    });

    // TODO: test for subsubheaders :(
    it("returns a top level header for an annotation under it", () => {
        expect(findPreviousHeaderForHeading(input[1] as Heading, input as SectionCache[])).toBe(0);
    });

    it("returns a sub header for an annotation under it", () => {
        expect(findPreviousHeaderForHeading(input[3] as Heading, input as SectionCache[])).toBe(2);
    });
});


describe.skip("findNextHeader", () => {

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
    it("should expose a function", () => {
        expect(findNextHeader).toBeDefined();
    });
});

describe.skip("updateHeaders", () => {
    it("should expose a function", () => {
        expect(updateHeaders).toBeDefined();
    });

    it("updateHeaders should return expected output", () => {
        // const retValue = updateHeaders(cacheItem,sections,key);
        expect(false).toBeTruthy();
    });
});
describe.skip("generateHeaderCounts", () => {

    beforeEach(() => {
        input = sectionsGenerator() as unknown as SectionCache[];
    });

    test("should return null for a top level header", () => {
        expect(findPreviousHeaderForHeading(input[6] as Heading, input as SectionCache[])).toBe(4);
        expect(findPreviousHeaderForHeading(input[0] as Heading, input as SectionCache[])).toBe(-1);
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

describe.skip("getAnnotationFilePath", () => {
    it("should expose a function", () => {
        expect(getAnnotationFilePath).toBeDefined();
    });

    it("getAnnotationFilePath should return expected output", () => {
        // const retValue = getAnnotationFilePath(path);
        expect(false).toBeTruthy();
    });
});
describe.skip("generateFlashcardsFileNameAndPath", () => {
    it("should expose a function", () => {
        expect(generateFlashcardsFileNameAndPath).toBeDefined();
    });

    it("generateFlashcardsFileNameAndPath should return expected output", () => {
        // const retValue = generateFlashcardsFileNameAndPath(bookPath);
        expect(false).toBeTruthy();
    });
});