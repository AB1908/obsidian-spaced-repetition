import { type annotation } from "../annotations";
import { ISourceStrategy } from "../ISourceStrategy";
import { getFileContents, getMetadataForFile } from "src/infrastructure/disk";
import { extractParagraphFromSection } from "src/data/utils/sectionExtractor";

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
                const extracted = extractParagraphFromSection(s, lines);
                return {
                    id: extracted.id,
                    type: "paragraph",
                    highlight: extracted.text,
                    note: "",
                    hasFlashcards: false,
                };
            });
    }
}
