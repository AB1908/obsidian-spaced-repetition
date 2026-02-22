import { parseAnnotations, isAnnotationProcessed } from "src/data/models/annotations";

describe("isAnnotationProcessed", () => {
    test("should return true if annotation has a category", () => {
        const annotation = {
            type: "annotation",
            id: "1",
            calloutType: "note",
            highlight: "hi",
            note: "",
            category: "insight",
        };
        expect(isAnnotationProcessed(annotation)).toBe(true);
    });

    test("should return false if annotation has no category", () => {
        const annotation = {
            type: "annotation",
            id: "2",
            calloutType: "note",
            highlight: "hi",
            note: "",
        };
        expect(isAnnotationProcessed(annotation)).toBe(false);
    });

    test("should return false if category is null", () => {
        const annotation = {
            type: "annotation",
            id: "3",
            calloutType: "note",
            highlight: "hi",
            note: "",
            category: null,
        } as any;
        expect(isAnnotationProcessed(annotation)).toBe(false);
    });
});

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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "location": undefined,
              "note": "",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
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
              "calloutType": "notes",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Onen i estel Edain, u-chebin estel anim.
            This is another line.",
              "id": "93813",
              "location": undefined,
              "note": "What a beautiful line by Tolkien
            This is another line.",
              "origin": undefined,
              "originalColor": undefined,
              "personalNote": undefined,
              "timestamp": undefined,
              "type": "annotation",
            }
        `);
    });

    test("should correctly parse a specific annotation with metadata", () => {
        const text = `> [!quote] 5734
> Memory metaphors
> ***
> 29##
> %%
> original_color: -11184811
> location: 25638
> timestamp: 1645176780813
> %%`;
        expect(parseAnnotations(text)).toMatchInlineSnapshot(`
            {
              "calloutType": "quote",
              "category": undefined,
              "deleted": undefined,
              "highlight": "Memory metaphors",
              "id": "5734",
              "location": "25638",
              "note": "29##",
              "origin": undefined,
              "originalColor": "-11184811",
              "personalNote": undefined,
              "timestamp": "1645176780813",
              "type": "annotation",
            }
        `);
    });
});
