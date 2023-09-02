import {
    bookSections, findNextHeader,
    findPreviousHeader,
    getAnnotationsForSection,
    Heading
} from "src/data/models/book";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
import { annotation } from "src/data/import/annotations";
import { beforeEach } from "@jest/globals";
import { HeadingCache, SectionCache } from "obsidian";

const { nanoid } = jest.requireActual("nanoid");
jest.doMock("nanoid", () => ({
    nanoid: nanoid
}));
// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {});

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
                type: "notes"
            },
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes"
            },
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien 2",
                type: "notes"
            }
        ]);
    });

    test("successfully gets annotations from subsection", () => {
        expect(getAnnotationsForSection("xHev-sAx", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes"
            }
        ]);
    });

    test("gets annotations from first subheader under heading 1", () => {
        expect(getAnnotationsForSection("xHev-sAx", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes"
            }
        ]);
    });

    test("gets annotations from second subheader under heading 1", () => {
        expect(getAnnotationsForSection("xHev-sA1", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien 2",
                type: "notes"
            }
        ]);
    });

    test("gets all nested annotations under last header", () => {
        expect(getAnnotationsForSection("WVcwnuIQ", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes"
            },
            {
                highlight: "> New highlight here.\n> This is another line.",
                id: 93813,
                note: "> Test",
                type: "notes"
            }
        ]);
    });

    test("gets all nested annotations under last subheader", () => {
        expect(getAnnotationsForSection("WVc23uIQ", bookSectionsArray)).toEqual([
            {
                highlight: "> New highlight here.\n> This is another line.",
                id: 93813,
                note: "> Test",
                type: "notes"
            }
        ]);
    });
});

let input: any[];
describe("findPreviousHeader", () => {
    beforeEach(() => {
        input = [
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
        input = [
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

describe("findNextHeader", () => {
    beforeEach(() => {
        input = [
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
    });

    test("should return null for a top level header", () => {
        expect(findNextHeader(input[6] as HeadingCache, input as SectionCache[])).toBe(8);
        expect(findNextHeader(input[0] as HeadingCache, input as SectionCache[])).toBe(6);
    });
    test("should return a top level header for a subheader", () => {
        expect(findNextHeader(input[4] as HeadingCache, input as SectionCache[])).toBe(6);
        expect(findNextHeader(input[2] as HeadingCache, input as SectionCache[])).toBe(4);
    });
    // // TODO: test for subsubheaders :(
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[1] as SectionCache)).toBe(0);
    // });
    // test("should return a top level header for an annotation under it", () => {
    //     expect(findPreviousHeader(input as SectionCache[], input[3] as SectionCache)).toBe(2);
    // });
});
