import { annotation } from "src/data/models/annotations";

export function getFilteredAnnotations(annotations: annotation[], filter: 'uncategorized' | 'all'): annotation[] {
    if (filter === 'all') {
        return annotations;
    }
    // Filter for annotations where category is undefined or null
    return annotations.filter(ann => ann.category === undefined || ann.category === null);
}
