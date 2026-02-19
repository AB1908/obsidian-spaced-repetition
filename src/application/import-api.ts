import { createFile, findFilesByExtension, getAllFolders, getTFileForPath, moveFile, renameFile, updateFrontmatter } from "src/infrastructure/disk";
import { generateMarkdownWithHeaders } from "src/data/utils/annotationGenerator";
import { ObsidianNotice } from "src/infrastructure/obsidian-facade";
import { MoonReaderStrategy } from "src/data/models";
import { ImportedBook } from "src/ui/routes/import/import-export";
import { AnnotationsNote } from "src/data/models/annotations-note/AnnotationsNote";
import { getPluginContext } from "./plugin-context";

export async function getImportedBooks(): Promise<ImportedBook[]> {
    const plugin = getPluginContext();
    const sourceNotes = plugin.annotationsNoteIndex.getAllAnnotationsNotes();
    const books: ImportedBook[] = [];

    for (const sourceNote of sourceNotes) {
        const frontmatter = sourceNote.getBookFrontmatter();
        if (frontmatter) {
            books.push({
                id: sourceNote.id,
                name: sourceNote.name,
                path: sourceNote.path
            });
        }
    }

    return books;
}

export function getImportableExports() {
    return findFilesByExtension("mrexpt");
}

export function getDestinationFolders() {
    return getAllFolders();
}

// todo: refactor and move disk related logic to appropriate layer
// also move business logic to appropriate class
export async function updateBookAnnotationsAndFrontmatter(
    annotationsPath: string,
    mrexptPath: string,
    sinceId: string
) {
    const plugin = getPluginContext();
    let book = plugin.annotationsNoteIndex.getAllAnnotationsNotes().find(b => b.path === annotationsPath);
    if (!book) {
        // Instantiate a temporary AnnotationsNote if not found in index (e.g. might be a new import or filtered out)
        book = new AnnotationsNote(annotationsPath, plugin);
    }

    const strategy = new MoonReaderStrategy(mrexptPath);
    const newAnnotations = await strategy.sync(sinceId);

    if (newAnnotations.length === 0) {
        new ObsidianNotice("No new annotations found.");
        return;
    }

    // Append new annotations markdown to the file
    const newAnnotationsMarkdown = generateMarkdownWithHeaders(newAnnotations);
    const tfile = getTFileForPath(annotationsPath);
    // @ts-ignore
    await app.vault.append(tfile, "\n" + newAnnotationsMarkdown); // Add a newline before appending

    // Find the new highest ID among all annotations
    const allAnnotations = await strategy.extract();
    const newLastExportedID = Math.max(...allAnnotations.map(ann => parseInt(ann.id, 10)));

    // Update frontmatter values using the new disk utility
    await updateFrontmatter(annotationsPath, {
        lastExportedTimestamp: Date.now(),
        lastExportedID: newLastExportedID,
    });

    new ObsidianNotice(`Updated ${newAnnotations.length} new annotations.`);
}

export async function getUnimportedMrExptFiles(): Promise<string[]> {
    const allMrExptFiles = findFilesByExtension("mrexpt");
    const importedBooks = await getImportedBooks();
    const importedPaths = new Set(importedBooks.map(b => b.path));
    return allMrExptFiles.filter(f => !importedPaths.has(f));
}

export async function importMoonReaderExport(mrexptPath: string, destinationFolder: string) {
    const strategy = new MoonReaderStrategy(mrexptPath);
    const annotations = await strategy.extract();

    if (annotations.length === 0) {
        throw new Error("No annotations found in the export file.");
    }

    const lastExportedID = Math.max(...annotations.map(ann => parseInt(ann.id, 10)));

    const fileName = mrexptPath.split("/").pop();
    const newMrexptPath = `${destinationFolder}/${fileName}`;
    await moveFile(mrexptPath, newMrexptPath);
    const annotationsPath = `${destinationFolder}/Annotations.md`;
    // @ts-ignore
    const existingFile = app.vault.getAbstractFileByPath(annotationsPath);
    if (existingFile) {
        await renameFile(annotationsPath, "Annotations_old.md");
    }

    const bookTitle = annotations.find(ann => ann.title)?.title || "Unknown Book";

    const frontmatter = `---
path: "${newMrexptPath}"
title: "${bookTitle}"
author: ""
lastExportedTimestamp: ${Date.now()}
lastExportedID: ${lastExportedID}
tags:
  - "review/book"
---
`;

    const markdown = generateMarkdownWithHeaders(annotations);
    await createFile(annotationsPath, frontmatter + markdown);

    return annotationsPath;
}
