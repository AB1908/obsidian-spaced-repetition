import type { AnnotationsLoaderParams } from "src/ui/routes/books/AnnotationListPage";
import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import { getAnnotationsForSection } from "src/api";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export function getPreviousAnnotationIdForSection(bookId: string, sectionId: string, blockId: string) {
    const section = getAnnotationsForSection(sectionId, bookId);
    if (!section || !section.annotations) return null;
    
    let find = section.annotations.findIndex(t => t.id === blockId);
    if (find === -1) return null;
    
    return section.annotations[find - 1]?.id || null;
}

export function getNextAnnotationIdForSection(bookId: string, sectionId: string, blockId: string) {
    const section = getAnnotationsForSection(sectionId, bookId);
    if (!section || !section.annotations) return null;

    let find = section.annotations.findIndex(t => t.id === blockId);
    if (find === -1) return null;

    return section.annotations[find + 1]?.id || null;
}
