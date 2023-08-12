export interface annotation {
    id:             string;
    type:           string;
    highlight:      string;
    note:           string;
    // TODO: do something about this optional thingy
    hasFlashcards?: boolean;
}

// TODO: Consider a feature where people can use their own regex for parsing
const ANNOTATION_REGEX = /> \[!(?<type>.*)\] (?<id>\d+)\n(?<highlight>(> .*\n)+)> \*\*\*\n> (?<note>(.*)+)/g;

// TODO: also use line for match since we need to correlate with markdown headers later
// todo: think of header representation
export function parseAnnotations(text: string): annotation {
    const parsedAnnotations: annotation[] = [];
    const annotationMatches = text.matchAll(ANNOTATION_REGEX);
    for (const match of annotationMatches) {
        parsedAnnotations.push({
            // TODO: potentially switch to string that also contains a short UUID?
            id: match.groups.id,
            type: match.groups.type,
            highlight: match.groups.highlight.trim().replace(/> /g, ""),
            note: match.groups.note.trim(),
            // todo: fix
        });
    }
    if (parsedAnnotations.length == 0) {
        new Error("parsedAnnotations: could not find annotation");
    }
    return parsedAnnotations[0];
}