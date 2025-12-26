import { readdirSync, readFileSync } from "fs";

const testdir = "/Users/abhishek/Documents/GitHub/obsidian-spaced-repetition/tests/json";
const contents = readdirSync(testdir);
const inputFileList = contents.filter(t => t.includes("input"));
const inputContents = inputFileList.map(t => JSON.parse(readFileSync(`${testdir}/${t}`).toString("utf8")));

export function filePathsWithTag(tag: string): string[] {
    return [ "Atomic Habits/Flashcards.md", "Memory - A Very Short Introduction/Flashcards.md", "Untitled - Flashcards.md"];
}

export const getParentOrFilename = (path: string) => {
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
    const outputFileName = inputContents.filter(t=> t.fileName.includes("getFileFromLinkText") && t.annotationLinkText == annotationLinkText)[0].fileName;
    return JSON.parse(outputLoader(outputFileName))["obj"];
}

export async function getFileContents(path: string) {
    const outputFileName = inputContents.filter(t=> t.path == path && t.fileName && t.fileName.includes("getFileContents"))[0].fileName;
    return JSON.parse(outputLoader(outputFileName))["obj"];
}

export const writeCardToDisk = jest.fn(async (path, string) => {});

export const updateCardOnDisk = jest.fn(async (path, originalText, updatedText) => {});

export function fileTags() {
    // @ts-ignore
    return new Map([
        [
            "Atomic Habits/Annotations.md",
            [
                "review/book",
                "research"
            ]
        ],
        [
            "Atomic Habits/Flashcards.md",
            [
                "flashcards"
            ]
        ],
        [
            "transactions.ledger",
            []
        ],
        [
            "Learning/Learning.md",
            "review/book"
        ],
        [
            "Memory - A Very Short Introduction/Annotations.md",
            [
                "review/book"
            ]
        ],
        [
            "Memory - A Very Short Introduction/Flashcards.md",
            [
                "flashcards"
            ]
        ],
        [
            "Untitled - Flashcards.md",
            [
                "flashcards"
            ]
        ],
        [
            "Untitled.md",
            [
                "review/book",
                "review/note"
            ]
        ]
    ]);
}

export function getCurrentDateIsoString() {
    return "2024-10-10";
}