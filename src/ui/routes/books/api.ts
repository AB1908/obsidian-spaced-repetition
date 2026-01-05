import type { AnnotationsLoaderParams } from "src/ui/routes/books/book/annotation/AnnotationListPage";
import { getPreviousAnnotationId, getNextAnnotationId } from "src/api";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export function getPreviousAnnotationIdForSection(bookId: string, sectionId: string | undefined, blockId: string) {
    return getPreviousAnnotationId(bookId, blockId, sectionId);
}

export function getNextAnnotationIdForSection(bookId: string, sectionId: string | undefined, blockId: string) {
    return getNextAnnotationId(bookId, blockId, sectionId);
}
