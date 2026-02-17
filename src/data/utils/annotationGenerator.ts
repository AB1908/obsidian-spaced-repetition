import { MoonReaderAnnotation } from "src/data/import/moonreader";
import { serializeMetadata } from "./metadataSerializer";
import { annotation } from "../models/annotations";

/**
 * Renders an internal annotation model to its Markdown representation.
 * This is the canonical way annotations are stored on disk.
 */
export function renderAnnotation(ann: annotation): string {
    const metadataText = serializeMetadata({
        original_color: ann.originalColor,
        location: ann.location,
        timestamp: ann.timestamp,
        category: ann.category,
        deleted: ann.deleted,
        personal_note: ann.personalNote,
        origin: ann.origin,
    });
    const noteContent = ann.note ? `\n> ${ann.note}` : "";

    return `> [!quote] ${ann.id}
> ${ann.highlight.replace(/\n/g, "\n> ")}
> ***${noteContent}
> %%
> ${metadataText.replace(/\n/g, "\n> ")}
> %%
`;
}

/**
 * Legacy support for MoonReaderAnnotation during initial import.
 * Internally uses renderAnnotation after mapping fields.
 */
export function generateAnnotationMarkdown(mra: MoonReaderAnnotation): string {
    return renderAnnotation({
        type: 'annotation',
        id: mra.id,
        calloutType: "quote", // Standard type
        highlight: mra.highlight,
        note: mra.note,
        origin: "moonreader",
        originalColor: mra.color,
        location: mra.location,
        timestamp: mra.timestamp
    });
}

export function generateMarkdownWithHeaders(annotations: MoonReaderAnnotation[]): string {
    const annotationsByChapter = annotations.reduce((acc, annotation) => {
        const chapter = annotation.chapter || "Uncategorized";
        if (!acc[chapter]) {
            acc[chapter] = [];
        }
        acc[chapter].push(annotation);
        return acc;
    }, {} as Record<string, MoonReaderAnnotation[]>);

    const sortedChapters = Object.keys(annotationsByChapter).sort();

    let result = [];
    for (const chapter of sortedChapters) {
        let chapterBlock = `# ${chapter}\n\n`;
        const chapterAnnotations = annotationsByChapter[chapter];
        chapterBlock += chapterAnnotations.map(annotation => generateAnnotationMarkdown(annotation).trim()).join("\n\n");
        result.push(chapterBlock);
    }

    return result.join("\n\n");
}
