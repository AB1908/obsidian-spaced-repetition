import {AnnotationCount, bookSections, getAnnotations, Heading} from "src/data/models/book";
import {sampleAnnotationMetadata, sampleAnnotationText} from "./disk.test";
import {annotation} from "src/data/import/annotations";

const {nanoid} = jest.requireActual("nanoid");
jest.doMock("nanoid", () => ({
    nanoid: nanoid,
}));

test("recursive counter", () => {
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
                        flashcards: [],
                    },
                    {
                        id: "d91ms7d",
                        color: "#338122",
                        highlight: "This is a sample highlight but without a note",
                        //TODO: think about whether this should be a null or an empty string on the backend
                        note: "",
                        flashcards: [],
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
                                flashcards: ["aksdjf"],
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
                        flashcards: [],
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

    let counter1 = AnnotationCount(deck);
    expect(counter1).toStrictEqual({
        sadf89u: {with: 1, without: 0},
        lasdkf8k: {with: 1, without: 3},
        "9dn319d": {with: 0, without: 0},
        alksdfj9: {with: 1, without: 3},
    });
});

test("bookSections", () => {
    expect(bookSections(sampleAnnotationMetadata, sampleAnnotationText)).toMatchSnapshot();
});

let bookSectionsArray = [
    {
        "display": "Header 1",
        "heading": "Header 1",
        "id": "-g4c-q2S",
        "level": 1,
    },
    {
        "highlight": "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
        "id": 93813,
        "note": ">",
        "type": "notes",
    },
    {
        "display": "SubHeader 1",
        "heading": "SubHeader 1",
        "id": "xHev-sAx",
        "level": 2,
    },
    {
        "highlight": "> Onen i estel Edain, u-chebin estel anim.",
        "id": 93813,
        "note": "> What a beautiful line by Tolkien",
        "type": "notes",
    },
    {
        "display": "SubHeader 2",
        "heading": "SubHeader 2",
        "id": "xHev-sA1",
        "level": 2,
    },
    {
        "highlight": "> Onen i estel Edain, u-chebin estel anim.",
        "id": 93813,
        "note": "> What a beautiful line by Tolkien 2",
        "type": "notes",
    },
    {
        "display": "Header 2",
        "heading": "Header 2",
        "id": "eLy47ZoN",
        "level": 1,
    },
    {
        "highlight": "> Onen i estel Edain, u-chebin estel anim.",
        "id": 93813,
        "note": "> What a beautiful line by Tolkien\n> This is another line.",
        "type": "notes",
    },
    {
        "display": "Last header",
        "heading": "Last header",
        "id": "WVcwnuIQ",
        "level": 1,
    },
    {
        "highlight": "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
        "id": 93813,
        "note": "> What a beautiful line by Tolkien",
        "type": "notes",
    },
    {
        "display": "Last subheader",
        "heading": "Last subheader",
        "id": "WVc23uIQ",
        "level": 2,
    },
    {
        "highlight": "> New highlight here.\n> This is another line.",
        "id": 93813,
        "note": "> Test",
        "type": "notes",
    },
] as (annotation|Heading)[];

describe("getAnnotations", () => {
    test("successfully gets nested annotations", () => {
        expect(
            getAnnotations(
                "-g4c-q2S",
                bookSectionsArray
            )
        ).toEqual([
            {
                "highlight": "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                "id": 93813,
                "note": ">",
                "type": "notes",
            },
            {
                "highlight": "> Onen i estel Edain, u-chebin estel anim.",
                "id": 93813,
                "note": "> What a beautiful line by Tolkien",
                "type": "notes",
            },
            {
                "highlight": "> Onen i estel Edain, u-chebin estel anim.",
                "id": 93813,
                "note": "> What a beautiful line by Tolkien 2",
                "type": "notes"
            }
        ]);
    });

    test("successfully gets annotations from subsection", () => {
        expect(getAnnotations("xHev-sAx", bookSectionsArray))
            .toEqual([
                {
                    "highlight": "> Onen i estel Edain, u-chebin estel anim.",
                    "id": 93813,
                    "note": "> What a beautiful line by Tolkien",
                    "type": "notes",
                },
            ]);
    });

    test("gets annotations from first subheader under heading 1", () => {
        expect(getAnnotations("xHev-sAx", bookSectionsArray))
            .toEqual([
                {
                    "highlight": "> Onen i estel Edain, u-chebin estel anim.",
                    "id": 93813,
                    "note": "> What a beautiful line by Tolkien",
                    "type": "notes",
                },
            ]);
    });

    test("gets annotations from second subheader under heading 1", () => {

        expect(getAnnotations("xHev-sA1", bookSectionsArray))
            .toEqual([
                {
                    "highlight": "> Onen i estel Edain, u-chebin estel anim.",
                    "id": 93813,
                    "note": "> What a beautiful line by Tolkien 2",
                    "type": "notes",
                },
            ]);
    });

    test("gets all nested annotations under last header", () => {
        expect(getAnnotations("WVcwnuIQ", bookSectionsArray))
            .toEqual([
                {
                    "highlight": "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
                    "id": 93813,
                    "note": "> What a beautiful line by Tolkien",
                    "type": "notes",
                },
                {
                    "highlight": "> New highlight here.\n> This is another line.",
                    "id": 93813,
                    "note": "> Test",
                    "type": "notes",
                },
            ]);
    });

    test("gets all nested annotations under last subheader", () => {
        expect(getAnnotations("WVc23uIQ", bookSectionsArray))
            .toEqual([
                {
                    "highlight": "> New highlight here.\n> This is another line.",
                    "id": 93813,
                    "note": "> Test",
                    "type": "notes",
                },
            ]);
    });
});