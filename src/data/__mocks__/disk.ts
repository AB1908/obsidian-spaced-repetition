import { readdirSync, readFileSync } from "fs";
import { getTFileForPath } from "src/data/disk";
import { TFile } from "obsidian";

// const disk = jest.genMockFromModule("src/data/disk");

const testdir = "/Users/abhishek/Documents/GitHub/obsidian-spaced-repetition/tests/json";
const contents = readdirSync(testdir);
const inputFileList = contents.filter(t => t.includes("input"));
const inputContents = inputFileList.map(t => JSON.parse(readFileSync(`${testdir}/${t}`).toString("utf8")));

const writeCardToDisk = (path: string, text: string) => {
};

export function filePathsWithTag(tag: string): string[] {
    return [ "Atomic Habits/Flashcards.md", "Memory - A Very Short Introduction/Flashcards.md", "Untitled - Flashcards.md"];
}

const getParentOrFilename = (path: string) => {
    if (path == "Atomic Habits/Annotations.md")
        return "Atomic Habits";
    if (path == "Memory - A Very Short Introduction/Annotations.md")
        return "Memory - A Very Short Introduction";
    if (path == "Untitled.md")
        return "Untitled";
};

const fileLoader = (path: string) => {
    return readFileSync(`${testdir}/${inputContents.filter(t => t.path === path)[0].fileName}.json`).toString();
};

const outputLoader = (path: string) => {
    return readFileSync(`${testdir}/${path}.json`).toString();
};

export function getMetadataForFile(path: string) {
    const outputFileName = inputContents.filter(t=> t.path == path && t.fileName && t.fileName.includes("getMetadataForFile"))[0].fileName;
    return JSON.parse(outputLoader(outputFileName));
}

export function getFileFromLinkText(annotationLinkText: string, path: string) {
    const outputFileName = inputContents.filter(t=> t.path == path && t.fileName && t.fileName.includes("getFileFromLinkText"))[0].fileName;
    return JSON.parse(outputLoader(outputFileName));
}

export async function getFileContents(path: string) {
    const outputFileName = inputContents.filter(t=> t.path == path && t.fileName && t.fileName.includes("getFileContents"))[0].fileName;
    return JSON.parse(outputLoader(outputFileName))["obj"];
}