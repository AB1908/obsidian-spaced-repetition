import { AnnotationCount, bookSections, getAnnotations, Heading } from "src/data/models/book";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
import { annotation } from "src/data/import/annotations";
import { generateTree } from "src/newparser";

const { nanoid } = jest.requireActual("nanoid");
jest.doMock("nanoid", () => ({
    nanoid: nanoid,
}));

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
    let output = {
        id: "alksdfj9",
        name: "Book 1",
        children: [
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
        ],
    };
    let deck = {
        id: "alksdfj9",
        name: "Book 1",
        sections: [
            {
                id: "lasdkf8k",
                title: "Chapter 1",
                sections: [
                    {
                        id: "d91maa3h",
                        color: "#339122",
                        highlight: "Onen i-Estel Edain, ú-chebin estel anim.",
                        note: "What a beautiful line by Tolkien",
                        hasFlashcards: false,
                    },
                    {
                        id: "d91ms7d",
                        color: "#338122",
                        highlight: "This is a sample highlight but without a note",
                        //TODO: think about whether this should be a null or an empty string on the backend
                        note: "",
                        hasFlashcards: false,
                    },
                    {
                        id: "sadf89u",
                        title: "Section 1",
                        sections: [
                            {
                                id: "9dk1m3jg",
                                color: "#338122",
                                highlight:
                                    "This is a sample highlight but without a note but also in chapter 1",
                                //TODO: think about whether this should be a null or an empty string on the backend
                                note: "9dn319d",
                                hasFlashcards: true,
                            },
                        ],
                    },
                    {
                        id: "9dk1mljg",
                        color: "#338122",
                        highlight:
                            "This is a sample highlight but without a note but also in chapter 1",
                        //TODO: think about whether this should be a null or an empty string on the backend
                        note: "",
                        hasFlashcards: false,
                    },
                ],
            },
            {
                id: "9dn319d",
                title: "Chapter 2",
                sections: [],
            },
        ],
    };
    // expect(counter(deck, {})).toEqual(1);

    // expect(AnnotationCount(deck)).toStrictEqual({
    //     sadf89u: {with: 1, without: 0},
    //     lasdkf8k: {with: 1, without: 3},
    //     "9dn319d": {with: 0, without: 0},
    //     alksdfj9: {with: 1, without: 3},
    // });

    expect(AnnotationCount(output)).toMatchInlineSnapshot(`
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
        expect(getAnnotations("-g4c-q2S", bookSectionsArray)).toEqual([
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
        expect(getAnnotations("xHev-sAx", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes",
            },
        ]);
    });

    test("gets annotations from first subheader under heading 1", () => {
        expect(getAnnotations("xHev-sAx", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien",
                type: "notes",
            },
        ]);
    });

    test("gets annotations from second subheader under heading 1", () => {
        expect(getAnnotations("xHev-sA1", bookSectionsArray)).toEqual([
            {
                highlight: "> Onen i estel Edain, u-chebin estel anim.",
                id: 93813,
                note: "> What a beautiful line by Tolkien 2",
                type: "notes",
            },
        ]);
    });

    test("gets all nested annotations under last header", () => {
        expect(getAnnotations("WVcwnuIQ", bookSectionsArray)).toEqual([
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
        expect(getAnnotations("WVc23uIQ", bookSectionsArray)).toEqual([
            {
                highlight: "> New highlight here.\n> This is another line.",
                id: 93813,
                note: "> Test",
                type: "notes",
            },
        ]);
    });
});
