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
    const lines = content.split(/\r?\n/);
    const annotations: MoonReaderAnnotation[] = [];

    for (let i = 0; i < lines.length; i++) {
        // Look for the start delimiter '#'.
        // Some exports might have trailing spaces.
        if (lines[i].trim() !== '#') {
            continue;
        }

        // Ensure we have enough lines for the mandatory header fields (10 fields after #)
        if (i + 10 >= lines.length) {
            break;
        }

        const id = lines[i + 1];
        const title = lines[i + 2];
        const path = lines[i + 3];
        const lpath = lines[i + 4];
        const chapter = lines[i + 5];
        const p1 = lines[i + 6];
        const location = lines[i + 7];
        const characters = lines[i + 8];
        const color = lines[i + 9];
        const timestamp = lines[i + 10];

        // Highlight text comes after timestamp, but there might be empty lines in between.
        let j = i + 11;
        while (j < lines.length && lines[j].trim() === "") {
            j++;
        }

        let highlight = "";
        let note = "";

        if (j < lines.length) {
            // Check if we hit the next record start (which would mean highlight is empty)
            if (lines[j].trim() !== '#') {
                highlight = lines[j];
                j++;

                // Note is optional and follows the highlight
                if (j < lines.length) {
                    const potentialNote = lines[j];
                    // If the next line is the start of a new record, it's not a note.
                    if (potentialNote.trim() !== '#') {
                        note = potentialNote;
                        j++;
                    }
                }
            }
        }

        annotations.push({
            id,
            title,
            path,
            lpath,
            chapter,
            p1,
            location,
            characters,
            color,
            timestamp,
            highlight,
            note,
        });

        // Advance the main loop index to where we left off.
        // The loop increments i, so we set i to j - 1.
        // If j points to the next '#', i will become j in the next iteration.
        i = j - 1;
    }

    return annotations;
}
