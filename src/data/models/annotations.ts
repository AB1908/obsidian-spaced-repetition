import { AnnotationMetadata, deserializeMetadata } from "../utils/metadataSerializer";

export interface annotation {
    id:             string;
    type:           string;
    highlight:      string;
    note:           string;
    hasFlashcards?: boolean;
    flashcardCount?: number;
    // Metadata fields
    category?:      number;
    deleted?:       boolean;
    personalNote?:  string;
    origin?:        string;
    originalColor?: string;
    location?:      string;
    timestamp?:     string;
}

export interface SectionAnnotations {
    id:          string;
    annotations: annotation[];
    title:       string;
}

// TODO: Consider a feature where people can use their own regex for parsing

// Metadata block is now optional (%% ... %%)

const ANNOTATION_REGEX = /> \[!(?<type>.*)] (?<id>\d+)\n(?<highlight>(?:> .*\n)+)> \*\*\*(?<note>(?:\n> (?!%%).*)*)(?:\n> %%\n(?<metadata>(?:> .*\n)+)> %%)?/g;



// TODO: also use line for match since we need to correlate with markdown headers later

// todo: think of header representation

export function parseAnnotations(text: string): annotation {

    const parsedAnnotations: annotation[] = [];

    const annotationMatches = text.matchAll(ANNOTATION_REGEX);

    for (const match of annotationMatches) {

        if (match.groups == null) throw new Error(`parseAnnotations: no annotations found for text ${text}`);

        

        const metadataText = match.groups.metadata ? match.groups.metadata.replace(/> /g, "").trim() : "";

        const metadata = deserializeMetadata(metadataText);



        parsedAnnotations.push({

            id: match.groups.id,

            type: match.groups.type,

            highlight: match.groups.highlight.trim().replace(/> /g, ""),

            note: match.groups.note ? match.groups.note.replace(/> /g, "").trim() : "",

            category: metadata.category,

            deleted: metadata.deleted,

            personalNote: metadata.personal_note,

            origin: metadata.origin,

            originalColor: metadata.original_color,

            location: metadata.location,

            timestamp: metadata.timestamp,

        });

    }

    if (parsedAnnotations.length === 0) {

        throw new Error(`parsedAnnotations: could not find annotation in text: ${text}`);

    }

    return parsedAnnotations[0];

}
