import { getTFileForPath } from "src/infrastructure/disk";
import { readBookFrontmatter } from "./frontmatter";

export function resolveSourceDisplayName(sourcePath: string, sourceId: string): string {
    const sourceFile = getTFileForPath(sourcePath).basename;
    const frontmatter = readBookFrontmatter(sourcePath, sourceId);
    return frontmatter?.title || sourceFile;
}
