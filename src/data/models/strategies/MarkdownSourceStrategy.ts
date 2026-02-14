import { type annotation } from "../annotations";
import { ISourceStrategy } from "../ISourceStrategy";
import { getFileContents, getMetadataForFile } from "src/infrastructure/disk";
import { nanoid } from "nanoid";
import { generateFingerprint } from "src/data/utils/fingerprint";

export class MarkdownSourceStrategy implements ISourceStrategy {
    constructor(private filePath: string) {}

    async extract(): Promise<annotation[]> {
        const metadata = getMetadataForFile(this.filePath);
        if (!metadata?.sections) return [];

        const fileText = await getFileContents(this.filePath);
        const lines = fileText.split("\n");

        return metadata.sections
            .filter(s => s.type === "paragraph")
            .map(s => {
                const text = lines.slice(s.position.start.line, s.position.end.line + 1)
                    .join("\n")
                    .replace(/\^.*$/g, "");
                return {
                    id: s.id || nanoid(8),
                    type: "paragraph",
                    highlight: text,
                    note: "",
                    hasFlashcards: false,
                };
            });
    }
}
