import { readdirSync, readFileSync } from "fs";

const testdir = "/Users/abhishek/Documents/GitHub/obsidian-spaced-repetition/tests/json";
const contents = readdirSync(testdir);
const inputFileList = contents.filter(t => t.includes("input"));
const inputContents = inputFileList.map(t => JSON.parse(readFileSync(`${testdir}/${t}`).toString("utf8")));

const writeCardToDisk = (path: string, text: string) => {
};

const filePathsWithTag = (tag: string) => [
    "Atomic Habits/Flashcards.md",
    "Memory - A Very Short Introduction/Flashcards.md",
    "Untitled - Flashcards.md"
];

const getFileContents = (path: string) => readFileSync(path);

const getParentOrFilename = (path: string) => {
    if (path == "Atomic Habits/Annotations.md")
        return "Atomic Habits";
    if (path == "Memory - A Very Short Introduction/Annotations.md")
        return "Memory - A Very Short Introduction";
    if (path == "Untitled.md")
        return "Untitled";
};

const fileLoader = (path: string) => {
    return readFileSync(`${testdir}/${inputContents.filter(t => t.path === path)[0].fileName}.json`);
};

const getMetadataForFile = fileLoader;

const getFileFromLinkText = (annotationLinkText: string, path: string) => {
    return fileLoader(path);
};