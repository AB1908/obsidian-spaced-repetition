// Given some string text, I should be able to make a deck from it

import {parseAnnotations} from "src/data";

describe("parseAnnotations should parse an annotation with ", () => {
    test("a single line note and single line highlight", () => {
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien
`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            note: "> What a beautiful line by Tolkien"
        }]);
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            note: "> What a beautiful line by Tolkien"
        }]);
    });

    test("a single line note and multi line highlight", () => {
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
            note: "> What a beautiful line by Tolkien"
        }]);
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien
`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
            note: "> What a beautiful line by Tolkien"
        }]);
    });

    test("a multi line note and single line highlight", () => {

        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien
> This is another line.
`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            note: "> What a beautiful line by Tolkien\n> This is another line."
        }]);
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien
> This is another line.`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.",
            note: "> What a beautiful line by Tolkien\n> This is another line."
        }]);

    });

    test("a multi line note and multi line highlight", () => {
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien
> This is another line.
`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
            note: "> What a beautiful line by Tolkien\n> This is another line."
        }]);
        expect(parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien
> This is another line.`)).toEqual([{
            id: 93813,
            type: "notes",
            highlight: "> Onen i estel Edain, u-chebin estel anim.\n> This is another line.",
            note: "> What a beautiful line by Tolkien\n> This is another line."
        }]);
    });
});

describe("metadata parser", () => {
    test("no metadata", () => {
        const metadataText: string = "<!--SR:8jfaj0d7!S,2021-08-11,4,270-->";

        // <!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->
        expect(parseMetadata("gibberish")).toBe(null);
        expect(parseMetadata(metadataText)).toEqual({
            flag: FLAG.SUSPEND,
            highlightId: "8jfaj0d7",
            dueDate: "2021-08-11",
            interval: 4,
            ease: 270
        })
    });

    test("only highlight", () => {

        // <!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->
        const metadata: string = "<!--SR:9fn28asl-->";
        expect(parseMetadata(metadata)).toEqual({
            highlightId: "9fn28asl",
            flag: null,
            dueDate: null,
            interval: null,
            ease: null
        })
    });

    test("highlight with scheduling info", () => {
        const metadataText: string = "<!--SR:8jfaj0d7!S,2021-08-11,4,270-->";

        expect(parseMetadata(metadataText)).toEqual({
            flag: FLAG.SUSPEND,
            highlightId: "8jfaj0d7",
            dueDate: "2021-08-11",
            interval: 4,
            ease: 270
        })
    });

});
