import { AnnotationCount, bookSections } from "src/data/models/book";
import { metadataCache, sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";

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
        sadf89u: { with: 1, without: 0 },
        lasdkf8k: { with: 1, without: 3 },
        "9dn319d": { with: 0, without: 0 },
        alksdfj9: { with: 1, without: 3 },
    });
});

test("bookSections", () => {
    expect(bookSections(sampleAnnotationMetadata, sampleAnnotationText)).toMatchInlineSnapshot(`
        Array [
          Object {
            "display": "Header 1",
            "heading": "Header 1",
            "level": 1,
            "position": Object {
              "end": Object {
                "col": 10,
                "line": 10,
                "offset": 102,
              },
              "start": Object {
                "col": 0,
                "line": 10,
                "offset": 92,
              },
            },
          },
          Object {
            "highlight": "> Onen i estel Edain, u-chebin estel anim.
        > This is another line.",
            "id": 93813,
            "note": ">",
            "type": "notes",
          },
          Object {
            "display": "SubHeader 1",
            "heading": "SubHeader 1",
            "level": 2,
            "position": Object {
              "end": Object {
                "col": 14,
                "line": 18,
                "offset": 212,
              },
              "start": Object {
                "col": 0,
                "line": 18,
                "offset": 198,
              },
            },
          },
          Object {
            "highlight": "> Onen i estel Edain, u-chebin estel anim.",
            "id": 93813,
            "note": "> What a beautiful line by Tolkien",
            "type": "notes",
          },
          Object {
            "display": "Header 2",
            "heading": "Header 2",
            "level": 1,
            "position": Object {
              "end": Object {
                "col": 10,
                "line": 25,
                "offset": 326,
              },
              "start": Object {
                "col": 0,
                "line": 25,
                "offset": 316,
              },
            },
          },
          Object {
            "highlight": "> Onen i estel Edain, u-chebin estel anim.",
            "id": 93813,
            "note": "> What a beautiful line by Tolkien
        > This is another line.",
            "type": "notes",
          },
          Object {
            "display": "Last header",
            "heading": "Last header",
            "level": 1,
            "position": Object {
              "end": Object {
                "col": 13,
                "line": 33,
                "offset": 467,
              },
              "start": Object {
                "col": 0,
                "line": 33,
                "offset": 454,
              },
            },
          },
          Object {
            "highlight": "> Onen i estel Edain, u-chebin estel anim.
        > This is another line.",
            "id": 93813,
            "note": "> What a beautiful line by Tolkien",
            "type": "notes",
          },
        ]
    `);
});
