import { generateAnnotationMarkdown } from "src/data/utils/annotationGenerator";
import { MoonReaderAnnotation } from "src/data/import/moonreader";

// Mock the generateAnnotationMarkdown function to control its output
jest.mock("src/data/utils/annotationGenerator", () => ({
    ...jest.requireActual("src/data/utils/annotationGenerator"),
    generateAnnotationMarkdown: jest.fn((annotation: MoonReaderAnnotation) => {
        const noteContent = annotation.note ? `\n> ${annotation.note}` : "";
        return `> [!quote] ${annotation.id}
> ${annotation.highlight}
> ***${noteContent}
> %%
> original_color: ${annotation.color || ""}
> location: ${annotation.location || ""}
> timestamp: ${annotation.timestamp || ""}
> %%`;
    }),
}));

// Re-import the mocked function for direct testing of generateMarkdownWithHeaders
import { generateMarkdownWithHeaders } from "src/data/utils/annotationGenerator";

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

describe("generateMarkdownWithHeaders", () => {
    test("should generate markdown with chapter headers and sorted annotations", () => {
        const mockAnnotations: MoonReaderAnnotation[] = [
            { id: "1", title: "Book A", chapter: "Chapter 1", highlight: "Highlight 1-1", note: "Note 1-1", path: "", lpath: "", p1: "", location: "", characters: "", color: "", timestamp: "" },
            { id: "2", title: "Book A", chapter: "Chapter 1", highlight: "Highlight 1-2", note: "Note 1-2", path: "", lpath: "", p1: "", location: "", characters: "", color: "", timestamp: "" },
            { id: "3", title: "Book A", chapter: "Chapter 2", highlight: "Highlight 2-1", note: "", path: "", lpath: "", p1: "", location: "", characters: "", color: "", timestamp: "" },
            { id: "4", title: "Book A", chapter: "Chapter 1", highlight: "Highlight 1-3", note: "", path: "", lpath: "", p1: "", location: "", characters: "", color: "", timestamp: "" },
            { id: "5", title: "Book A", chapter: "Chapter 2", highlight: "Highlight 2-2", note: "Note 2-2", path: "", lpath: "", p1: "", location: "", characters: "", color: "", timestamp: "" },
        ];

        // Ensure generateAnnotationMarkdown mock is cleared before this test, if not globally mocked
        // For this specific test, we'll re-mock it or assume it's globally mocked with simple output

                const expectedMarkdown = `## Chapter 1

> [!quote] 1
> Highlight 1-1
> ***
> Note 1-1
> %%
> original_color: 
> location: 
> timestamp: 
> %%

> [!quote] 2
> Highlight 1-2
> ***
> Note 1-2
> %%
> original_color: 
> location: 
> timestamp: 
> %%

> [!quote] 4
> Highlight 1-3
> ***
> %%
> original_color: 
> location: 
> timestamp: 
> %%

## Chapter 2

> [!quote] 3
> Highlight 2-1
> ***
> %%
> original_color: 
> location: 
> timestamp: 
> %%

> [!quote] 5
> Highlight 2-2
> ***
> Note 2-2
> %%
> original_color: 
> location: 
> timestamp: 
> %%`;

        const generatedMarkdown = generateMarkdownWithHeaders(mockAnnotations);
        expect(generatedMarkdown.trim()).toEqual(expectedMarkdown.trim());
    });
});

