import { MoonReaderAnnotation } from "src/data/import/moonreader";

export function generateAnnotationMarkdown(annotation: MoonReaderAnnotation): string {
    const hiddenMetadata = [
        `original_color: ${annotation.color}`,
        `location: ${annotation.location}`,
        `timestamp: ${annotation.timestamp}`
    ].join("\n");

    // Ensure note is not null/undefined
    const noteContent = annotation.note ? `\n> ${annotation.note}` : "";

    // We use the ID from MoonReader (which is usually a timestamp or simple ID)
    // If it conflicts, we might need to prefix it, but for now we trust it.

    return `> [!quote] ${annotation.id}
> ${annotation.highlight.replace(/\n/g, "\n> ")}
> ***${noteContent}
> %%
> ${hiddenMetadata.replace(/\n/g, "\n> ")}
> %%
`;
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
        let chapterBlock = `## ${chapter}\n\n`;
        const chapterAnnotations = annotationsByChapter[chapter];
        chapterBlock += chapterAnnotations.map(annotation => generateAnnotationMarkdown(annotation).trim()).join("\n\n");
        result.push(chapterBlock);
    }

    return result.join("\n\n");
}
