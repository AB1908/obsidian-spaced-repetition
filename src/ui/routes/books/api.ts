import type { AnnotationsLoaderParams } from "src/ui/routes/books/book/annotation/AnnotationListPage";
import { getPreviousAnnotationId, getNextAnnotationId } from "src/api";
import type { NavigationFilter } from "src/api";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export function getPreviousAnnotationIdForSection(
    bookId: string,
    sectionId: string | undefined,
    blockId: string,
    filter?: NavigationFilter
) {
    return getPreviousAnnotationId(bookId, blockId, sectionId, filter);
}

export function getNextAnnotationIdForSection(
    bookId: string,
    sectionId: string | undefined,
    blockId: string,
    filter?: NavigationFilter
) {
    return getNextAnnotationId(bookId, blockId, sectionId, filter);
}
