export interface AnnotationMetadata {
    original_color?: string;
    location?: string;
    timestamp?: string;
    category?: string;
    deleted?: boolean;
    personal_note?: string;
    origin?: string;
}

/**
 * Encapsulates the serialization and deserialization of annotation metadata
 * stored within Obsidian comments (%% ... %%).
 */
export function serializeMetadata(metadata: AnnotationMetadata): string {
    const parts: string[] = [];
    if (metadata.original_color) parts.push(`original_color: ${metadata.original_color}`);
    if (metadata.location) parts.push(`location: ${metadata.location}`);
    if (metadata.timestamp) parts.push(`timestamp: ${metadata.timestamp}`);
    if (metadata.category !== undefined && metadata.category !== null) parts.push(`category: ${metadata.category}`);
    if (metadata.deleted) parts.push(`deleted: ${metadata.deleted}`);
    if (metadata.personal_note) parts.push(`personal_note: ${metadata.personal_note.replace(/\n/g, "<BR>")}`);
    if (metadata.origin) parts.push(`origin: ${metadata.origin}`);

    return parts.join("\n");
}

export function deserializeMetadata(text: string): AnnotationMetadata {
    const metadata: AnnotationMetadata = {};
    const lines = text.split("\n");

    for (const line of lines) {
        const [key, ...valueParts] = line.split(": ");
        if (!key || valueParts.length === 0) continue;

        const value = valueParts.join(": ").trim();
        const cleanKey = key.trim();

        switch (cleanKey) {
            case "original_color":
                metadata.original_color = value;
                break;
            case "location":
                metadata.location = value;
                break;
            case "timestamp":
                metadata.timestamp = value;
                break;
            case "category":
                if (!/^-?\d+$/.test(value)) {
                    metadata.category = value;
                }
                break;
            case "deleted":
                metadata.deleted = value === "true";
                break;
            case "personal_note":
                metadata.personal_note = value.replace(/<BR>/g, "\n");
                break;
            case "origin":
                metadata.origin = value;
                break;
        }
    }

    return metadata;
}
