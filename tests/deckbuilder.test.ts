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