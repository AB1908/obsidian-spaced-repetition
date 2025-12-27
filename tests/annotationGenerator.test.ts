import { generateAnnotationMarkdown } from "src/data/utils/annotationGenerator";
import { MoonReaderAnnotation } from "src/data/import/moonreader";

describe("generateAnnotationMarkdown", () => {
    test("should format annotation correctly", () => {
        const annotation: MoonReaderAnnotation = {
            id: "123",
            title: "Book Title",
            path: "/path/to/book",
            lpath: "/local/path",
            chapter: "Chapter 1",
            p1: "0",
            location: "10%",
            characters: "100",
            color: "#ff0000",
            timestamp: "1600000000",
            highlight: "This is a highlight",
            note: "This is a note"
        };

        const markdown = generateAnnotationMarkdown(annotation);

        expect(markdown).toContain("> [!quote] 123");
        expect(markdown).toContain("> This is a highlight");
        expect(markdown).toContain("> ***\n> This is a note");
        expect(markdown).toContain("> %%\n> original_color: #ff0000");
    });

    test("should handle missing note", () => {
        const annotation: MoonReaderAnnotation = {
            id: "123",
            title: "Book Title",
            path: "/path/to/book",
            lpath: "/local/path",
            chapter: "Chapter 1",
            p1: "0",
            location: "10%",
            characters: "100",
            color: "#ff0000",
            timestamp: "1600000000",
            highlight: "This is a highlight",
            note: ""
        };

        const markdown = generateAnnotationMarkdown(annotation);

                expect(markdown).toContain("> This is a highlight");

                // We expect the separator to exist even if empty, to ensure parser compatibility

                expect(markdown).toContain("> ***"); 

                // But the note content itself should be empty (directly followed by metadata block)

                expect(markdown).toMatch(/> \*\*\*\n> %%/); 

            });

        });

        
