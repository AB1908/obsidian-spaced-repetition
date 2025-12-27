export interface MoonReaderAnnotation {
    id: string;
    title: string;
    path: string;
    lpath: string;
    chapter: string;
    p1: string;
    location: string;
    characters: string;
    color: string;
    timestamp: string;
    highlight: string;
    note: string;
}

/**
 * Parses Moon+ Reader .mrexpt files.
 * The format is a series of records separated by # on a new line.
 * Each record has specific fields on subsequent lines.
 */
export function parseMoonReaderExport(content: string): MoonReaderAnnotation[] {
    // The regex based on the provided snippet, completed with highlight and note fields.
    // Note: .mrexpt files often have multiple highlights.
    const regexpHighlight = /#\n(?<id>.*)\n(?<title>.*)\n(?<path>.*)\n(?<lpath>.*)\n(?<chapter>.*)\n(?<p1>.*)\n(?<location>.*)\n(?<characters>.*)\n(?<color>.*)\n(?<timestamp>.*)\n(?<highlight>.*)(?:\n(?<note>.*))?/g;

    const annotations: MoonReaderAnnotation[] = [];
    const matches = content.matchAll(regexpHighlight);

    for (const match of matches) {
        if (match.groups) {
            annotations.push({
                id: match.groups.id,
                title: match.groups.title,
                path: match.groups.path,
                lpath: match.groups.lpath,
                chapter: match.groups.chapter,
                p1: match.groups.p1,
                location: match.groups.location,
                characters: match.groups.characters,
                color: match.groups.color,
                timestamp: match.groups.timestamp,
                highlight: match.groups.highlight,
                note: match.groups.note || "",
            });
        }
    }

    return annotations;
}
