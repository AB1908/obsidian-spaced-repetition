import type { AnnotationFilter } from "src/utils/annotation-filters";

export const NAVIGATION_FILTER_SESSION_KEY = "annotationNavigationFilter";

export function getNavigationFilterFromSessionStorage(): AnnotationFilter | undefined {
    const serializedFilter = sessionStorage.getItem(NAVIGATION_FILTER_SESSION_KEY);
    if (!serializedFilter) return undefined;

    try {
        return JSON.parse(serializedFilter) as AnnotationFilter;
    } catch {
        return undefined;
    }
}

export function setNavigationFilterInSessionStorage(filter: AnnotationFilter): void {
    sessionStorage.setItem(NAVIGATION_FILTER_SESSION_KEY, JSON.stringify(filter));
}
