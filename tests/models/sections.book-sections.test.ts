import { bookSections } from "src/data/models/sections/book-sections";

describe("sections bookSections", () => {
    test("throws when metadata is null", () => {
        expect(() => bookSections(null, "", [], { index: { addToAnnotationIndex() {} } } as never))
            .toThrow("bookSections: metadata cannot be null/undefined");
    });
});
