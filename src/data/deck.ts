import {parse} from "src/old_parser";
import {SRSettings} from "src/settings";
import {plugin} from "src/main";

export function createParsedCardsArray(fileText: string, settings: SRSettings) {
    plugin.parsedCards = [...parse(fileText, settings)]
}

