import { parseAnnotations } from "src/data/models/annotations";

describe("parseAnnotations should parse an annotation with", () => {
    test("a single line highlight", () => {
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> 
`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "note": "",
              "type": "notes",
            }
        `);
    });

    test("a single line note and single line highlight", () => {
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien
`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien",
              "type": "notes",
            }
        `);
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien",
              "type": "notes",
            }
        `);
    });

    test("a single line note and multi line highlight", () => {
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien",
              "type": "notes",
            }
        `);
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien
`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien",
              "type": "notes",
            }
        `);
    });

    test("a multi line note and single line highlight", () => {
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien
> This is another line.
`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "type": "notes",
            }
        `);
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> ***
> What a beautiful line by Tolkien
> This is another line.`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "type": "notes",
            }
        `);
    });

    test("a multi line note and multi line highlight", () => {
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien
> This is another line.
`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "type": "notes",
            }
        `);
        expect(
            parseAnnotations(`# Heading 1

> [!notes] 93813
> Onen i estel Edain, u-chebin estel anim.
> This is another line.
> ***
> What a beautiful line by Tolkien
> This is another line.`)
        ).toMatchInlineSnapshot(`
            {
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "type": "notes",
            }
        `);
    });
});
