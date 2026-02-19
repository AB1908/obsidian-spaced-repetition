import { customAlphabet } from "nanoid";
import {
    ensureFolder,
    getFileContents,
    getMetadataForFile,
    moveFile,
    overwriteFile,
} from "src/infrastructure/disk";

const blockId = customAlphabet("0123456789abcdef", 6);

export async function addBlockIdsToParagraphs(path: string) {
    const metadata = getMetadataForFile(path);
    const paragraphSections = metadata?.sections?.filter(section => section.type === "paragraph");
    if (!paragraphSections?.length) return;

    const lines = (await getFileContents(path)).split("\n");
    let updated = false;

    for (const section of paragraphSections) {
        if (section.id) continue;
        const endLine = section.position.end.line;
        lines[endLine] = `${lines[endLine]} ^${blockId()}`;
        updated = true;
    }

    if (updated) {
        await overwriteFile(path, lines.join("\n"));
    }
}

export async function ensureDirectMarkdownSourceInOwnFolder(sourcePath: string): Promise<string> {
    const pathParts = sourcePath.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const parentPath = pathParts.length > 1 ? pathParts.slice(0, -1).join("/") : "";
    const baseName = fileName.replace(/\.md$/i, "");
    const ownFolderPath = parentPath ? `${parentPath}/${baseName}` : baseName;
    const targetPath = `${ownFolderPath}/${fileName}`;

    if (sourcePath === targetPath) return sourcePath;

    await ensureFolder(ownFolderPath);
    await moveFile(sourcePath, targetPath);
    return targetPath;
}
