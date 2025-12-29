import { annotation } from "src/data/models/annotations";

export function getFilteredAnnotations(annotations: annotation[], mainFilter: 'uncategorized' | 'all', categoryFilter: number | null): annotation[] {
    if (mainFilter === 'uncategorized') {
        return annotations.filter(ann => ann.category === undefined || ann.category === null);
    } else { // mainFilter === 'all'
        if (categoryFilter !== null) {
            return annotations.filter(ann => ann.category === categoryFilter);
        }
        return annotations;
    }
}
