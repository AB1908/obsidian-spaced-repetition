import {parse} from "src/old_parser";
import {SRSettings} from "src/settings";
import {Flashcard} from "src/data/models/flashcard";
import {plugin} from "src/main";

export function createParsedCardsArray(fileText: string, settings: SRSettings) {
    plugin.parsedCards = [...parse(fileText, settings)]
}

export function maturityCounts(flashcards: Flashcard[])  {
    let newCount = 0, mature = 0, learning = 0;
    flashcards.forEach(t => {
        if (t.interval >= 32) {
            mature += 1;
        } else if (t.interval && t.interval < 32) {
            learning += 1;
        } else {
        // } if (!t.interval) {
            newCount += 1;
        }
    });
    return {mature, learning, new: newCount};
}
