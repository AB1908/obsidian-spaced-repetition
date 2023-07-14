import { AnnotationCount, bookSections, getAnnotations } from "src/data/models/book";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
const { nanoid } = jest.requireActual("nanoid");
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
        sadf89u: { with: 1, without: 0 },
        lasdkf8k: { with: 1, without: 3 },
        "9dn319d": { with: 0, without: 0 },
        alksdfj9: { with: 1, without: 3 },
    });
});

test("bookSections", () => {
    expect(bookSections(sampleAnnotationMetadata, sampleAnnotationText)).toMatchSnapshot();
});
