import {TFile} from "obsidian";

export async function writeCardToDisk(file: TFile, text: string) {
    await app.vault.append(file, text);
}

export function getTFileForPath(path: string) {
    const tfile = app.vault.getAbstractFileByPath(path);
    if (tfile instanceof TFile) return tfile;
    else return null;
}

export function updateCardOnDisk(file: TFile, originalText: string, updatedText: string) {
    
}