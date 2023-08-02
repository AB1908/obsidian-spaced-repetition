import {getFileContents, getHeadersForFile} from "src/data/import/disk";

export interface annotation {
    id:             number;
    type:           string;
    highlight:      string;
    note:           string;
    // TODO: do something about this optional thingy
    hasAnnotations?: boolean;
}

// TODO: Consider a feature where people can use their own regex for parsing
const ANNOTATION_REGEX = /> \[!(?<type>.*)\] (?<id>\d+)(?<highlight>(\n> .*)+)\n> \*\*\*(?<note>(\n> .*)+)/g;

// TODO: also use line for match since we need to correlate with markdown headers later
// todo: think of header representation
export function parseAnnotations(text: string): annotation {
    const parsedAnnotations: annotation[] = [];
    const annotationMatches = text.matchAll(ANNOTATION_REGEX);
    for (let match of annotationMatches) {
        parsedAnnotations.push({
            // TODO: potentially switch to string that also contains a short UUID?
            id: Number(match.groups.id),
            type: match.groups.type,
            highlight: match.groups.highlight.trim(),
            note: match.groups.note.trim(),
            // todo: fix
        })
    }
    return parsedAnnotations[0];
}

export async function extractAnnotations(path: string) {
    const fileContents = (await getFileContents(path)).split("\n");
    const fileHeaders = getHeadersForFile(path);
    // todo: last iteration
    for (let i = 0; i < fileHeaders.length-1; i++) {
        // header.level
        // header.position.start
        parseAnnotations(fileContents.slice(fileHeaders[i].position.start.line, fileHeaders[i + 1]?.position.start.line ?? fileContents.length).join("\n"))
    }
}