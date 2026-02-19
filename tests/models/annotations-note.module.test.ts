import { AnnotationsNote } from "src/data/models/annotations-note/AnnotationsNote";

describe("annotations-note module", () => {
    test("constructs with path", () => {
        const note = new AnnotationsNote("x.md", {} as never);
        expect(note.path).toBe("x.md");
    });
});
