import { FLAG, parseMetadata } from "src/data/parser";

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/main", () => {});

describe("metadata parser", () => {
    test("no metadata", () => {
        const metadataText = "<!--SR:12345!S,2021-08-11,4,270-->";

        // <!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->
        expect(() => parseMetadata("gibberish")).toThrowErrorMatchingInlineSnapshot(
            `"how can this not have an annotation id"`
        );
        expect(parseMetadata(metadataText)).toEqual({
            flag: FLAG.SUSPEND,
            annotationId: "12345",
            dueDate: "2021-08-11",
            interval: 4,
            ease: 270,
        });
    });

    test("only highlight", () => {
        const metadata = "<!--SR:12345-->";
        expect(parseMetadata(metadata)).toEqual({
            annotationId: "12345",
            flag: null,
            dueDate: null,
            interval: null,
            ease: null,
        });
    });

    test("block with long annotation id", () => {
        const metadata = "testing\n?\ntestin\n<!--SR:hjhjhlkap-->";
        expect(parseMetadata(metadata)).toEqual({
            annotationId: "hjhjhlkap",
            flag: null,
            dueDate: null,
            interval: null,
            ease: null,
        });
    });

    test("highlight with scheduling info", () => {
        const metadataText = "<!--SR:12345!S,2021-08-11,4,270-->";

        expect(parseMetadata(metadataText)).toEqual({
            flag: FLAG.SUSPEND,
            annotationId: "12345",
            dueDate: "2021-08-11",
            interval: 4,
            ease: 270,
        });
    });

    test("metadata with fingerprint and no scheduling", () => {
        const metadata = "<!--SR:tWxSv_No!fp:a1b2c3-->";
        expect(parseMetadata(metadata)).toEqual({
            annotationId: "tWxSv_No",
            flag: null,
            dueDate: null,
            interval: null,
            ease: null,
            fingerprint: "a1b2c3",
        });
    });

    test("metadata with fingerprint and scheduling", () => {
        const metadata = "<!--SR:abc123!L,2024-10-21,1,210!fp:dead01-->";
        expect(parseMetadata(metadata)).toEqual({
            flag: FLAG.LEARNING,
            annotationId: "abc123",
            dueDate: "2024-10-21",
            interval: 1,
            ease: 210,
            fingerprint: "dead01",
        });
    });

    test("backward compat: metadata without fingerprint still parses", () => {
        const metadata = "<!--SR:abc123!L,2024-10-21,1,210-->";
        const result = parseMetadata(metadata);
        expect(result.annotationId).toBe("abc123");
        expect(result.fingerprint).toBeUndefined();
    });
});
