import {TFile} from "obsidian";

export async function writeCardToDisk(file: TFile, cardOnDisk: string) {
    await app.vault.append(file, cardOnDisk);
}

export function getTFileForPath(path: string) {
    const tfile = app.vault.getAbstractFileByPath(path);
    if (tfile instanceof TFile) return tfile
    else return null;
}