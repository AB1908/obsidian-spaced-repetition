import { moment, TagCache, TFile } from "obsidian";
import { ANNOTATIONS_YAML_KEY } from "src/data/models/sourceNote";

export async function writeCardToDisk(path: string, text: string) {
    await app.vault.append(getTFileForPath(path), text);
}

export function getTFileForPath(path: string): TFile {
    const tfile = app.vault.getAbstractFileByPath(path);
    if (tfile instanceof TFile) return tfile;
    else throw new Error(`no getTFileForPath: no TFile found for ${path}`);
}

export async function updateCardOnDisk(path: string, originalText: string, updatedText: string) {
    const tfile = getTFileForPath(path);
    if (tfile === null)
        return false;
    const originalFileText = await app.vault.read(tfile);
    const updatedFileText = originalFileText.replace(originalText, updatedText);
    await app.vault.modify(tfile, updatedFileText);
    return true;
}

export async function deleteCardOnDisk(path: string, originalText: string) {
    const tfile = getTFileForPath(path);
    if (tfile === null)
        return false;
    const originalFileText = await app.vault.read(tfile);
    const updatedFileText = originalFileText.replace(originalText, "");
    await app.vault.modify(tfile, updatedFileText);
    return true;
}

function setOfHashesWithTags(tag: string) {
    const findTag = (tag: string) => (t: TagCache) => t.tag.includes(tag);
    const hashSet = new Set<string>();
    const fileHashes = Object.keys(app.metadataCache.metadataCache);
    for (const hash of fileHashes) {
        const cachedFileMetadata = app.metadataCache.metadataCache[hash];
        if (cachedFileMetadata.tags?.find(findTag(tag)) || cachedFileMetadata.frontmatter?.tags?.includes(tag)) {
            hashSet.add(hash);
        }
    }
    return hashSet;
}

function findFilesWithHashInSet(hashSet: Set<string>) {
    const filePaths: string[] = [];
    const fileCacheKeys = Object.keys(app.metadataCache.fileCache);
    for (const file of fileCacheKeys) {
        if (hashSet.has(app.metadataCache.fileCache[file].hash)) {
            filePaths.push(file);
        }
    }
    return filePaths;
}

// todo: refactor to move business logic into higher layer
// todo: replace metadataCache usage with clean abstraction to reduce mocking problems
export function fileTags() {
    const fileMap = new Map<string,string>();
    const fileCache = structuredClone(app.metadataCache.fileCache);
    const metadataCache = structuredClone(app.metadataCache.metadataCache);
    for (const key of Object.keys(fileCache)) {
        fileMap.set(fileCache[key].hash, key);
    }
    const tagMap = new Map<string, string[]>();
    const transformTags = (tagCache: TagCache[]) => {return tagCache.map(t=>t.tag);};
    for (const [hash, path] of fileMap) {
        const frontmatterTags = metadataCache[hash]?.frontmatter?.tags;
        const tagsArray = frontmatterTags || [];
        const fileTags = metadataCache[hash]?.tags;
        if (fileTags) {
            let tags = transformTags(fileTags);
            // todo: need to check if there can be pound symbols within a tag's text
            tags = tags.map(t => t.replace("#", ""));
            tagsArray.push(...tags);
        }
        tagMap.set(path, tagsArray);
    }
    return tagMap;
}

export function filePathsWithTag(tag: string): string[] {
    const hashSet = setOfHashesWithTags(tag);
    return findFilesWithHashInSet(hashSet);
}

export async function getFileContents(path: string) {
    return await app.vault.read(getTFileForPath(path));
}

export function getParentOrFilename(path: string) {
    // TODO: What if root folder?
    const tFileForPath = getTFileForPath(path);
    // files at root folder level return "" for parent name
    return tFileForPath.parent?.name || tFileForPath.basename;
}

export function getMetadataForFile(path: string) {
    const tfile = getTFileForPath(path);
    if (tfile === null) {
        throw new Error(`getMetadataForFile: no TFile found at path ${path}`);
    }
    return app.metadataCache.getFileCache(tfile);
}

// takes a book path, finds parent if any and creates flashcard file
// todo: refactor to move business logic up one layer
export async function createFlashcardsFileForBook(bookPath: string, path: string) {
    // use sourcenote path
    const sourceNotePath = `${bookPath.replace(".md", "")}`;
    const fileContents = `---
${ANNOTATIONS_YAML_KEY}: "[[${sourceNotePath}]]"
tags:
  - flashcards
---

`;
    await app.vault.create(path, fileContents);
}

export function getFileFromLinkText(annotationLinkText: string, path: string) {
    const destinationTFile = app.metadataCache.getFirstLinkpathDest(annotationLinkText, path);
    if (destinationTFile instanceof TFile) {
        return destinationTFile.path;
    } else {
        throw new Error(`${path} does not have a valid parent in metadata`);
    }
}
// done: this isn't necessarily an abstraction over Obsidian APIs and contains business logic
// move to some other file instead
// done: how can the return type for this be undefined? WTF??

export function getAnnotationFilePath(path: string) {
    const metadata = getMetadataForFile(path);
    const annotationFromYaml = metadata?.frontmatter?.[ANNOTATIONS_YAML_KEY];
    if (!annotationFromYaml)
        throw new Error(`getAnnotationFilePath: ${path} does not have a valid parent`);
    const annotationLinkText = annotationFromYaml.replaceAll(/[[\]]/g, "");
    const destinationTFile = app.metadataCache.getFirstLinkpathDest(annotationLinkText, path);
    if (destinationTFile instanceof TFile) {
        return destinationTFile.path;
    } else {
        throw new Error(`getAnnotationFilePath: ${path} does not have a valid parent`);
    }
}

export function generateFlashcardsFileNameAndPath(bookPath: string) {
    const tfile = getTFileForPath(bookPath);
    let filename, parentPath;
    // example of path at root level:
    // "Folder 1/File.md": parent is "Folder 1"
    // "Test.md": parent is "/"
    // I need to generate "/Test - Flashcards.md" or "Folder 1/Flashcards.md"
    if (tfile.parent.name) { // tfile has its own folder, reuse the folder
        filename = "Flashcards.md";
        parentPath = `${tfile.parent.path}`;
    } else { // the tfile is at the root level, use original filename
        filename = `${tfile.basename} - Flashcards.md`;
        parentPath = ``;
    }
    const path = `${parentPath}/${filename}`;
    return { filename, path };
}

