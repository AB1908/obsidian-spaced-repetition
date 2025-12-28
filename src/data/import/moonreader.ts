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
 *
 * This parser uses a two-pass approach to handle chapter naming:
 * 1. A first pass parses the entire file into a raw list of annotations.
 * 2. A second pass processes this raw list statefully. It looks for special
 *    "chapter marker" annotations (where the note is '#'). The highlight of
 *    such an annotation is treated as the chapter name for all subsequent
 *    annotations, and the marker itself is discarded from the final output.
 */
export function parseMoonReaderExport(content: string, sinceId: string | null = null): MoonReaderAnnotation[] {
    // This regex is based on the 16-field structure revealed by the reference parser.
    // It correctly captures all parts of a standard MoonReader record.
    // We explicitly capture field 11 (bookmarkText), 12 (noteText), and 13 (highlightText)
    // as per the reference parser, then interpret them in the second pass.
    const recordRegex = /^\s*#\s*\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\n(.*?)\s*$/gm;

    // A temporary type to hold all 16 fields from the regex match before processing.
    interface RawMoonReaderRecord extends MoonReaderAnnotation {
        bookmarkText: string;
        noteTextRaw: string; // This is the field 12 from regex
        highlightTextRaw: string; // This is the field 13 from regex
        t1: string;
        t2: string;
        t3: string;
    }

    const rawRecords: RawMoonReaderRecord[] = [];
    const matches = content.matchAll(recordRegex);

    // First pass: Parse all records into a raw list using the 16-field regex.
    for (const match of matches) {
        // Explicitly map all 16 captured groups.
        rawRecords.push({
            id: match[1] || "",
            title: match[2] || "",
            path: match[3] || "",
            lpath: match[4] || "",
            chapter: match[5] || "", // This is the original chapter number from the file.
            p1: match[6] || "",
            location: match[7] || "",
            characters: match[8] || "",
            color: match[9] || "",
            timestamp: match[10] || "",
            bookmarkText: match[11] || "", // Field 11
            noteTextRaw: match[12] || "",  // Field 12
            highlightTextRaw: match[13] || "", // Field 13
            t1: match[14] || "",
            t2: match[15] || "",
            t3: match[16] || "",
            // highlight and note fields are populated in the second pass based on record type.
            highlight: "",
            note: "",
        });
    }

    // Second pass: Classify records, process chapter markers, and filter out bookmarks.
    const finalAnnotations: MoonReaderAnnotation[] = [];
    let currentChapterName: string | null = null;

    for (const record of rawRecords) {
        // --- Classification based on definitive rules ---
        const isChapterMarker = record.noteTextRaw.trim() === '#'; // Field 12 is '#'
        const isBookmark = record.bookmarkText.trim() !== '' && record.noteTextRaw.trim() === '' && record.highlightTextRaw.trim() === ''; // Field 11 has text, 12 and 13 are empty.

        if (isChapterMarker) {
            // Chapter Marker: Identified by noteTextRaw being '#'.
            // Chapter name is in highlightTextRaw (Field 13).
            currentChapterName = record.highlightTextRaw.replace(/<BR>/g, ": ");
            // This record is not added to finalAnnotations.
        } else if (isBookmark) {
            // Bookmark: Identified by bookmarkText (Field 11) having content, but noteTextRaw and highlightTextRaw are empty.
            // This record is skipped entirely.
        } else {
            // Regular Annotation: Any record that is not a Chapter Marker or a Bookmark.
            const assignedChapter = currentChapterName || record.chapter || "Uncategorized";

            finalAnnotations.push({
                id: record.id,
                title: record.title,
                path: record.path,
                lpath: record.lpath,
                chapter: assignedChapter,
                p1: record.p1,
                location: record.location,
                characters: record.characters,
                color: record.color,
                timestamp: record.timestamp,
                highlight: record.highlightTextRaw.replace(/<BR>/g, "\n"), // Highlight from highlightTextRaw (Field 13)
                note: record.noteTextRaw.replace(/<BR>/g, "\n"),      // Note from noteTextRaw (Field 12)
            });
        }
    }

    if (sinceId !== null) {
        const sinceIdNum = parseInt(sinceId, 10);
        if (!isNaN(sinceIdNum)) {
            return finalAnnotations.filter(ann => {
                const annId = parseInt(ann.id, 10);
                return !isNaN(annId) && annId > sinceIdNum;
            });
        }
    }

    return finalAnnotations;
}
