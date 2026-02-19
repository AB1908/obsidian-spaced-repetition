import { annotation } from "src/data/models/annotations";
import { paragraph } from "src/data/models/paragraphs";
import { Heading, type BookMetadataSection } from "src/data/models/sections/types";
import {
    isAnnotation,
    isAnnotationOrParagraph,
    isChapter,
    isHeading,
    isParagraph,
} from "src/data/models/sections/guards";

describe("sections guards", () => {
    test("narrow by section type", () => {
        const heading = new Heading({
            heading: "Chapter 1",
            level: 1,
            display: "Chapter 1",
            position: undefined as never,
        });
        const annotationSection: annotation = {
            type: "annotation",
            id: "ann-1",
            highlight: "h",
            note: "n",
            calloutType: "",
            hasFlashcards: false,
            deleted: false,
        };
        const paragraphSection: paragraph = {
            type: "paragraph",
            id: "p-1",
            text: "p",
            hasFlashcards: false,
            wasIdPresent: true,
            fingerprint: "fp",
        };

        const sections: BookMetadataSection[] = [heading, annotationSection, paragraphSection];

        expect(isHeading(sections[0])).toBe(true);
        expect(isChapter(sections[0])).toBe(true);
        expect(isAnnotation(sections[1])).toBe(true);
        expect(isParagraph(sections[2])).toBe(true);
        expect(isAnnotationOrParagraph(sections[1])).toBe(true);
        expect(isAnnotationOrParagraph(sections[2])).toBe(true);
    });
});
