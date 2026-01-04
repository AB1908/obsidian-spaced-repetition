import type { AnnotationsLoaderParams } from "src/ui/routes/books/book/annotation/AnnotationListPage";
import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import { getAnnotationsForSection } from "src/api";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export function getPreviousAnnotationIdForSection(bookId: string, sectionId: string, blockId: string) {
    // TODO: This currently fetches the full list of annotations. It does not respect filters 
    // applied in the UI (AnnotationListPage), which can lead to inconsistent navigation.
    const section = getAnnotationsForSection(sectionId, bookId);
    if (!section || !section.annotations) return null;
    
    let find = section.annotations.findIndex(t => t.id === blockId);
    if (find === -1) return null;
    
    return section.annotations[find - 1]?.id || null;
}

export function getNextAnnotationIdForSection(bookId: string, sectionId: string, blockId: string) {
    // TODO: This currently fetches the full list of annotations. It does not respect filters 
    // applied in the UI (AnnotationListPage), which can lead to inconsistent navigation.
    const section = getAnnotationsForSection(sectionId, bookId);
    if (!section || !section.annotations) return null;

    let find = section.annotations.findIndex(t => t.id === blockId);
    if (find === -1) return null;

    return section.annotations[find + 1]?.id || null;
}
