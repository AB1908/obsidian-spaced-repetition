import { annotation } from "src/data/models/annotations";

export type AnnotationMainFilter = "unprocessed" | "processed" | "all";

export interface AnnotationFilter {
    mainFilter?: AnnotationMainFilter;
    categoryFilter?: string | null;
    colorFilter?: string | null;
}

export interface FilterableAnnotation {
    category?: string | null;
    deleted?: boolean;
    originalColor?: string;
}

export function matchesAnnotationFilter(ann: FilterableAnnotation, filter?: AnnotationFilter): boolean {
    if (ann.deleted) return false;
    if (!filter) return true;

    const mainFilter = filter.mainFilter ?? "all";
    const category = ann.category;
    const isProcessed = category !== undefined && category !== null;

    if (mainFilter === "processed") {
        if (filter.categoryFilter !== undefined && filter.categoryFilter !== null) {
            return category === filter.categoryFilter;
        }
        return isProcessed;
    }

    if (mainFilter === "unprocessed") {
        if (isProcessed) return false;
        if (filter.colorFilter) {
            return ann.originalColor === filter.colorFilter;
        }
        return true;
    }

    return true;
}

export function getFilteredAnnotations(
    annotations: annotation[],
    mainFilter: AnnotationMainFilter,
    categoryFilter: string | null,
    colorFilter: string | null
): annotation[] {
    return annotations.filter((ann) =>
        matchesAnnotationFilter(ann, {
            mainFilter,
            categoryFilter,
            colorFilter,
        })
    );
}
