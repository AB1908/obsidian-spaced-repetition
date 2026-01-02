import { annotation } from "src/data/models/annotations";

export function getFilteredAnnotations(annotations: annotation[], mainFilter: 'unprocessed' | 'processed' | 'all', categoryFilter: number | null, colorFilter: string | null): annotation[] {
    switch (mainFilter) {
        case 'unprocessed':
            let unprocessed = annotations.filter(ann => ann.category === undefined || ann.category === null);
            if (colorFilter) {
                unprocessed = unprocessed.filter(ann => ann.originalColor === colorFilter);
            }
            return unprocessed;
        case 'processed':
            if (categoryFilter !== null) {
                return annotations.filter(ann => ann.category === categoryFilter);
            }
            return annotations.filter(ann => ann.category !== undefined && ann.category !== null);
        case 'all':
            return annotations;
        default:
            return annotations;
    }
}
