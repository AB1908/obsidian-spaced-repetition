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
        // <!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->
        const metadata = "<!--SR:12345-->";
        expect(parseMetadata(metadata)).toEqual({
            annotationId: "12345",
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
});
