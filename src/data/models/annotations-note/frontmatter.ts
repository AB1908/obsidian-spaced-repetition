import { getMetadataForFile } from "src/infrastructure/disk";
import type { BookFrontmatter } from "./types";

export function readBookFrontmatter(sourcePath: string, sourceId: string): BookFrontmatter | null {
    try {
        const metadata = getMetadataForFile(sourcePath);
        const frontmatter = metadata?.frontmatter;

        if (!frontmatter) return null;
        if (
            frontmatter.path &&
            frontmatter.title &&
            frontmatter.lastExportedTimestamp !== undefined &&
            frontmatter.lastExportedID !== undefined
        ) {
            return {
                id: sourceId,
                path: frontmatter.path,
                annotationsPath: sourcePath,
                title: frontmatter.title,
                author: frontmatter.author || "",
                lastExportedTimestamp: frontmatter.lastExportedTimestamp,
                lastExportedID: frontmatter.lastExportedID,
                tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
            };
        }

        console.warn(`Skipping malformed frontmatter in ${sourcePath}`);
    } catch (e) {
        console.error(`Error processing source note ${sourcePath}:`, e);
    }
    return null;
}
