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
