import { writeFileSync, readdirSync } from "fs";
import {nanoid} from "nanoid";
import {moment, TFile} from "obsidian";

export function consoleStart(obj: any, name?: string) {
    console.group(name || "input");
    console.log(obj);
    console.log(JSON.stringify(obj));
    console.groupEnd();
}

export function consoleEnd(obj: any) {
    console.group("output");
    console.log(obj);
    console.log(JSON.stringify(obj));
    console.groupEnd();
}

const STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
const ARGUMENT_NAMES = /([^\s,]+)/g;
export function getParamNames(func: Function) {
    const fnStr = func.toString().replace(STRIP_COMMENTS, "");
    let result = fnStr.slice(fnStr.indexOf("(") + 1, fnStr.indexOf(")")).match(ARGUMENT_NAMES);
    if (result === null)
        result = [];
    return result;
}

export function logArgs(inputArgs: IArguments, outputArgs: any) {
    const paramNames = getParamNames(inputArgs.callee);
    const input = {};
    const rand = nanoid(5);
    paramNames.forEach((elem, index) => input[elem] = inputArgs[index]);
    const funcName = inputArgs.callee.name;
    const outputFileName = `${funcName}-output-${rand}`;
    input["fileName"] = outputFileName;
    const timeString = moment().format();
    const inputFileName = `${funcName}-input-${rand}`;
    writeToDirectory(inputFileName, JSON.stringify(removeCircular(input)));
    writeToDirectory(outputFileName, JSON.stringify(removeCircular(outputArgs)));
    console.group(funcName);
    console.group("inputs");
    for (const key of Object.keys(input)) {
        console.group(key);
        console.log(input[key]);
        console.groupEnd();
    }
    console.groupEnd();
    console.group("outputs");
    console.log(outputArgs);
    console.groupEnd();
    console.groupEnd();
    // writeJSON(JSON.stringify())
}

async function writeJSON(obj: any, name?: string) {
    const normalizedObj = removeCircular(obj);
}

function removeCircular(obj: any) {
    let copy;
    debugger;
    if ((typeof obj) == "object" && !(Array.isArray(obj))) {
        copy = Object.assign({}, obj);
        for (const key of Object.keys(copy)) {
            if (copy[key] instanceof TFile) {
                copy[key].vault = {};
                copy[key].parent = {};
            }
            if (key == "siblings") {
                copy[key] = null;
            }
            if (key == "deckTree") {
                copy[key] = null;
            }
        }
    }
    return copy || {obj};
}

function writeToDirectory(fileName: string, fileContent: string) {
    const directoryPath = "/home/ab1908/Documents/GitHub/obsidian-spaced-repetition/tests";

    try {
        const files = readdirSync(directoryPath);

        // Check if the directory contains the desired file
        // if (files.includes(fileName)) {
        const filePath = `${directoryPath}/${fileName.replaceAll(/[+:]/g, "-")}.json`;
        writeFileSync(filePath, fileContent, {flag:"wx"});
        console.log(`Data written to file: ${filePath}`);
        // } else {
        //     console.error('File not found in directory.');
        // }
    } catch (error) {
        console.error("Error reading directory:", error);
    }
}

// writeToDirectory();
