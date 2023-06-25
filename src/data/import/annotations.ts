export interface annotation {
    id:             number;
    type:           string;
    highlight:      string;
    note:           string;
}

// TODO: Consider a feature where people can use their own regex for parsing
const ANNOTATION_REGEX = /> \[!(?<type>.*)\] (?<id>\d+)(?<highlight>(\n> .*)+)\n> \*\*\*(?<note>(\n> .*)+)/g;

// TODO: also use line for match since we need to correlate with markdown headers later
export function parseAnnotations(fileContents: string): annotation[] {
    const parsedAnnotations: annotation[] = [];
    const annotationMatches = fileContents.matchAll(ANNOTATION_REGEX);
    for (let match of annotationMatches) {
        parsedAnnotations.push({
            // TODO: potentially switch to string that also contains a short UUID?
            id: Number(match.groups.id),
            type: match.groups.type,
            highlight: match.groups.highlight.trim(),
            note: match.groups.note.trim(),
        })
    }
    return parsedAnnotations;
}