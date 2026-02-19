import type { annotation } from "src/data/models/annotations";
import { renderAnnotation } from "src/data/utils/annotationGenerator";
import { updateCardOnDisk } from "src/infrastructure/disk";
import type { BookMetadataSections } from "../sections/types";

export async function updateAnnotationOnDisk(
    sourcePath: string,
    bookSections: BookMetadataSections,
    annotationId: string,
    updates: Partial<annotation>
) {
    const annotationIndex = bookSections.findIndex(t => t.id === annotationId);
    if (annotationIndex === -1) throw new Error(`updateAnnotation: annotation not found for id ${annotationId}`);
    const originalAnnotation = bookSections[annotationIndex];

    const originalMarkdown = renderAnnotation(originalAnnotation);

    const updatedAnnotation = { ...originalAnnotation, ...updates };
    const updatedMarkdown = renderAnnotation(updatedAnnotation);

    const writeSuccessful = await updateCardOnDisk(sourcePath, originalMarkdown, updatedMarkdown);
    if (writeSuccessful) {
        bookSections[annotationIndex] = updatedAnnotation;
    }
    return writeSuccessful;
}
