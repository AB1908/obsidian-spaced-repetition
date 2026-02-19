import type { annotation } from "src/data/models/annotations";
import { Heading, type BookMetadataSections } from "src/data/models/sections/types";
import {
    findNextHeader,
    findPreviousHeaderForHeading,
    findPreviousHeaderForSection,
    generateHeaderCounts,
} from "src/data/models/sections/heading-graph";

describe("sections heading graph", () => {
    function buildHeading(name: string, level: number) {
        return new Heading({
            heading: name,
            level,
            display: name,
            position: undefined as never,
        });
    }

    test("finds previous/next heading boundaries", () => {
        const h1 = buildHeading("H1", 1);
        const h2 = buildHeading("H2", 2);
        const ann = {
            type: "annotation",
            id: "1",
            calloutType: "quote",
            highlight: "hl",
            note: "",
            hasFlashcards: false,
        } as annotation;
        const sections = [h1, h2, ann] as BookMetadataSections;

        expect(findPreviousHeaderForSection(ann, sections)).toBe(1);
        expect(findPreviousHeaderForHeading(h2, sections)).toBe(0);
        expect(findNextHeader(h1, sections)).toBe(-1);
    });

    test("computes heading counts from section flashcard flags", () => {
        const h1 = buildHeading("H1", 1);
        const annWith = {
            type: "annotation",
            id: "2",
            calloutType: "quote",
            highlight: "a",
            note: "",
            hasFlashcards: true,
        } as annotation;
        const annWithout = {
            type: "annotation",
            id: "3",
            calloutType: "quote",
            highlight: "b",
            note: "",
            hasFlashcards: false,
        } as annotation;

        const result = generateHeaderCounts([h1, annWith, annWithout]);
        const first = result[0] as Heading;
        expect(first.counts.with).toBe(1);
        expect(first.counts.without).toBe(1);
    });
});
