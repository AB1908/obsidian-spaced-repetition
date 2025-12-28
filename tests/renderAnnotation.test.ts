import { renderAnnotation } from "src/data/utils/annotationGenerator";
import { annotation } from "src/data/models/annotations";

describe("renderAnnotation", () => {
    test("should correctly render annotation with deleted status", () => {
        const ann: annotation = {
            id: "5734",
            type: "notes",
            highlight: "Memory metaphors",
            note: "29##",
            deleted: true,
            hasFlashcards: false
        };

        expect(renderAnnotation(ann)).toMatchInlineSnapshot(`
            "> [!quote] 5734
            > Memory metaphors
            > ***
            > 29##
            > %%
            > deleted: true
            > %%
            "
        `);
    });
});
