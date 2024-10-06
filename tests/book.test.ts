import {
    findPreviousHeaderForHeading
} from "src/data/models/sourceNote";


// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {
});



export const sectionsGenerator = () => [
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
        expect(findPreviousHeaderForHeading(input[8], input)).toBe(0);
    });
});
