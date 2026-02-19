import { AnnotationsNoteIndex } from "src/data/models/annotations-note/AnnotationsNoteIndex";

describe("annotations-note index module", () => {
    test("constructs empty index", () => {
        const idx = new AnnotationsNoteIndex();
        expect(idx.sourceNotes).toEqual([]);
    });
});
