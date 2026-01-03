import type { AnnotationsLoaderParams } from "src/ui/routes/books/AnnotationListPage";
import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export function getPreviousAnnotationIdForSection(annotations: (annotation | paragraph)[], blockId: string) {
    let find = annotations.findIndex(t => t.id === blockId);
    return annotations[find - 1]?.id || null;
}

export function getNextAnnotationIdForSection(annotations: (annotation | paragraph)[], blockId: string) {
    let find = annotations.findIndex(t => t.id === blockId);
    return annotations[find + 1]?.id || null;
}
