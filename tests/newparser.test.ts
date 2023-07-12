import {findPreviousHeader, generateTree} from "src/newparser";
import type {SectionCache} from "obsidian";
import {beforeEach} from "@jest/globals";

describe("generateTree", () => {
    test("should nest a paragraph within previous heading", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1
            },
            {
                type: "paragraph"
            }
        ]
        expect(generateTree(input)).toStrictEqual(
            [
                {
                    heading: "Heading 1",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        }
                    ]
                },
            ]
        )
    });

    test("should nest each paragraph in each heading", () => {
        const input = [
            {
                heading: "Heading 1",
                level: 1
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
            },
        ]
        expect(generateTree(input)).toStrictEqual(
            [
                {
                    heading: "Heading 1",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        }
                    ]
                },
                {
                    heading: "Heading 2",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        }
                    ]
                },
            ]
        )
    });

    test("should nest the subheading in the heading", () => {
        const input = [
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
        ]
        expect(generateTree(input)).toStrictEqual(
            [
                {
                    heading: "Heading 1",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        } ,
                        {
                            heading: "SubHeading 1",
                            level: 2,
                            children: [
                                {
                                    type: "paragraph"
                                }
                            ]
                        },
                    ]
                }
            ]
        )
    })

    test("should nest both subheadings under the same heading", () => {
        const input = [
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
        ]
        expect(generateTree(input)).toStrictEqual(
            [
                {
                    heading: "Heading 1",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        } ,
                        {
                            heading: "SubHeading 1",
                            level: 2,
                            children: [
                                {
                                    type: "paragraph"
                                }
                            ]
                        },
                        {
                            heading: "SubHeading 2",
                            level: 2,
                            children: [
                                {
                                    type: "paragraph"
                                }
                            ]
                        },
                    ]
                }
            ]
        )
    })

    test("should nest subheadings correctly and return only headings", () => {
        const input = [
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
            },
        ]
        expect(generateTree(input)).toStrictEqual(
            [
                {
                    heading: "Heading 1",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        } ,
                        {
                            heading: "SubHeading 1",
                            level: 2,
                            children: [
                                {
                                    type: "paragraph"
                                }
                            ]
                        },
                        {
                            heading: "SubHeading 2",
                            level: 2,
                            children: [
                                {
                                    type: "paragraph"
                                }
                            ]
                        },
                    ]
                },
                {
                    heading: "Heading 2",
                    level: 1,
                    children: [
                        {
                            type: "paragraph"
                        },
                    ]
                },
            ]
        )
    })
})

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
            },
        ];
    })

    test("should return null for a top level header", () => {
        expect(findPreviousHeader(input as SectionCache[], input[6] as SectionCache)).toBe(null);
        expect(findPreviousHeader(input as SectionCache[], input[0] as SectionCache)).toBe(null);
    });
    test("should return a top level header for a subheader", () => {
        expect(findPreviousHeader(input as SectionCache[], input[4] as SectionCache)).toBe(0);
        expect(findPreviousHeader(input as SectionCache[], input[2] as SectionCache)).toBe(0);
    });
    // TODO: test for subsubheaders :(
});