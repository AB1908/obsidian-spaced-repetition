import {getAllTags, HeadingCache, TFile} from "obsidian";
import {LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR} from "./constants";
import {Deck} from "./Deck";
import {t} from "./lang/helpers";
import {LinkStat, PluginData} from "./main";
import {parse} from "./old_parser";
import {CardType} from "./scheduler/scheduling";
import {SRSettings} from "./settings";
import {Stats} from "./stats-modal";
import {cyrb53, escapeRegexString} from "./utils";
import {Card} from "src/Card";
import {
    generateClozeSiblingMatches,
    multiLineBasicSiblingMatches,
    multiLineReversedSiblingMatches,
    singleLineBasicSiblingMatches,
    singleLineReversedSiblingMatches
} from "src/Sibling";
import {logArgs} from "src/devUtils";

import {ParsedCard} from "src/data/models/parsedCard";
// import {consoleStart, logArgs} from "src/devUtils";

//TODO: Also include decks that don't have due flashcards
export async function sync(syncLock: boolean, setSyncLock: Function, data: PluginData): Promise<Deck> {
    let incomingLinks: Record<string, LinkStat[]> = {};
    let dueDatesFlashcards: Record<number, number> = {}; // Record<# of days in future, due count>

    if (syncLock) {
        return;
    }
    setSyncLock(true);
    const deckTree = new Deck("root", null);

    const cardStats = {
        eases: {},
        intervals: {},
        newCount: 0,
        youngCount: 0,
        matureCount: 0,
    };

    const now = window.moment(Date.now());
    const todayDate: string = now.format("YYYY-MM-DD");
    // clear bury list if we've changed dates
    if (todayDate !== data.buryDate) {
        data.buryDate = todayDate;
        data.buryList = [];
    }

    const notes: TFile[] = app.vault.getMarkdownFiles();
    for (const note of notes) {
        if (data.settings.noteFoldersToIgnore.some((folder) => note.path.startsWith(folder))) {
            continue;
        }

        if (incomingLinks[note.path] === undefined) {
            incomingLinks[note.path] = [];
        }

        const links = app.metadataCache.resolvedLinks[note.path] || {};
        for (const targetPath in links) {
            if (incomingLinks[targetPath] === undefined) incomingLinks[targetPath] = [];

            // markdown files only
            if (targetPath.split(".").pop().toLowerCase() === "md") {
                incomingLinks[targetPath].push({
                    sourcePath: note.path,
                    linkCount: links[targetPath],
                });

                // graph.link(note.path, targetPath, links[targetPath]);
            }
        }

        const deckPath: string[] = findDeckPath(note, data);
        if (deckPath.length !== 0) {
            await findFlashcardsInNote(
                note,
                deckPath,
                data,
                deckTree,
                cardStats,
                dueDatesFlashcards
            );
        }

        const fileCachedData = app.metadataCache.getFileCache(note) || {};

        const tags = getAllTags(fileCachedData) || [];

        let shouldIgnore = true;
        const matchedNoteTags = [];

        for (const tagToReview of data.settings.tagsToReview) {
            if (tags.some((tag) => tag === tagToReview || tag.startsWith(tagToReview + "/"))) {
                // if (!Object.prototype.hasOwnProperty.call(reviewDecks, tagToReview)) {
                    // reviewDecks[tagToReview] = new ReviewDeck(tagToReview);
                // }
                matchedNoteTags.push(tagToReview);
                shouldIgnore = false;
                break;
            }
        }
    }

    // sort the deck names
    deckTree.sortSubdecksList();
    if (data.settings.showDebugMessages) {
        console.log(`SR: ${t("DECKS")}`, deckTree);
    }

    if (data.settings.showDebugMessages) {
        console.log(
            "SR: " +
            t("SYNC_TIME_TAKEN", {
                t: Date.now() - now.valueOf(),
            })
        );
    }

    // statusBar.setText(
    //     t("STATUS_BAR", {
    //         dueNotesCount: dueNotesCount,
    //         dueFlashcardsCount: deckTree.dueFlashcardsCount,
    //     })
    // );
    // reviewQueueView.redraw();

    setSyncLock(false);
    return deckTree;
}

function deleteSchedulingDates(cardText: string, scheduling: RegExpMatchArray[], fileText: string, fileChanged: boolean, expectedLength: number) {
    const idxSched: number = cardText.lastIndexOf("<!--SR:") + 7;
    let newCardText: string = cardText.substring(0, idxSched);
    for (let i = 0; i < expectedLength; i++)
        newCardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
    newCardText += "-->";

    const replacementRegex = new RegExp(escapeRegexString(cardText), "gm");
    fileText = fileText.replace(replacementRegex, () => newCardText);
    fileChanged = true;
    return {fileText, fileChanged};
}

function doExtraSchedulingDatesExist(scheduling: RegExpMatchArray[], siblingMatches: CardSides[]) {
    return scheduling.length > siblingMatches.length;
}

function generateSiblingsFromCardType(cardType: CardType, settings: SRSettings, cardText: string) {
    const siblingMatches: CardSides[] = [];
    if (cardType === CardType.Cloze) {
        siblingMatches.push(...(generateClozeSiblingMatches(settings, cardText)))
    } else if (cardType === CardType.SingleLineBasic) {
        siblingMatches.push(...(singleLineBasicSiblingMatches(cardText, settings)));
    } else if (cardType === CardType.SingleLineReversed) {
        siblingMatches.push(...(singleLineReversedSiblingMatches(cardText, settings)));
    } else if (cardType === CardType.MultiLineBasic) {
        siblingMatches.push(...(multiLineBasicSiblingMatches(cardText, settings)));
    } else if (cardType === CardType.MultiLineReversed) {
        siblingMatches.push(...(multiLineReversedSiblingMatches(cardText, settings)));
    }
    return siblingMatches;
}

export interface SchedulingInfo {
    due: number;
    ease: number;
    interval: number;
}

export function extractSchedulingArray(cardText: string) {
    let scheduling: RegExpMatchArray[] = [...cardText.matchAll(MULTI_SCHEDULING_EXTRACTOR)];
    if (scheduling.length === 0)
        scheduling = [...cardText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];
    return scheduling;
}

async function findFlashcardsInNote(
    note: TFile,
    deckPath: string[],
    data: PluginData,
    deckTree: Deck,
    cardStats: Stats,
    dueDatesFlashcards: Record<number, number>,
    buryOnly = false,
    ignoreStats = false
): Promise<number> {
    let fileText: string = await app.vault.read(note);
    let fileChanged = false;
    const settings: SRSettings = data.settings;
    const noteDeckPath = deckPath;

    const parsedCards: ParsedCard[] = parse(fileText, settings);
    for (const parsedCard of parsedCards) {
        deckPath = noteDeckPath;
        let {cardText, cardType, lineNo, metadataText: cardMetadata} = parsedCard;

        if (!settings.convertFoldersToDecks) {
            const tagInCardRegEx = /^#[^\s#]+/gi;
            const cardDeckPath = cardText
                .match(tagInCardRegEx)
                ?.slice(-1)[0]
                .replace("#", "")
                .split("/");
            if (cardDeckPath) {
                deckPath = cardDeckPath;
                cardText = cardText.replaceAll(tagInCardRegEx, "");
            }
        }

        deckTree.createDeck([...deckPath]);

        if (buryOnly) {
            data.buryList.push(cyrb53(cardText));
            continue;
        }
        const siblingMatches = generateSiblingsFromCardType(cardType, settings, cardText);
        let scheduling = extractSchedulingArray(cardMetadata);

        if (doExtraSchedulingDatesExist(scheduling, siblingMatches)) {
            ({fileText, fileChanged} = deleteSchedulingDates(cardText, scheduling, fileText, fileChanged, siblingMatches.length));
        }

        ({ dueDatesFlashcards } = insertSiblingsIntoDeck(
            parsedCard,
            siblingMatches,
            scheduling,
            note,
            ignoreStats,
            deckPath,
            deckTree,
            dueDatesFlashcards,
            data
        ));
    }

    if (fileChanged) {
        await app.vault.modify(note, fileText);
    }

    return 0;
}

function getCardContext(cardLine: number, headings: HeadingCache[]): string {
    const stack: HeadingCache[] = [];
    for (const heading of headings) {
        if (heading.position.start.line > cardLine) {
            break;
        }

        while (stack.length > 0 && stack[stack.length - 1].level >= heading.level) {
            stack.pop();
        }

        stack.push(heading);
    }

    let context = "";
    for (const headingObj of stack) {
        headingObj.heading = headingObj.heading.replace(/\[\^\d+\]/gm, "").trim();
        context += headingObj.heading + " > ";
    }
    return context.slice(0, -3);
}

export interface CardSides {
    front: string;
    back: string;
    clozeInsertionAt?: number;
}

function queryCardSide(siblingMatch: CardSides) {
    const {front, back} = {front: siblingMatch.front, back: siblingMatch.back.trim()};
    return {front, back, clozeInsertionAt: siblingMatch.clozeInsertionAt};
}

function generateParsedSchedulingInfo(scheduling: RegExpMatchArray[], siblingNumber: number): SchedulingInfo {
    const interval: number = parseInt(scheduling[siblingNumber][2]),
        ease: number = parseInt(scheduling[siblingNumber][3]);
    const dueUnix: number = window
        .moment(scheduling[siblingNumber][1], ["YYYY-MM-DD", "DD-MM-YYYY"])
        .valueOf();
    return {due: dueUnix, interval, ease};
}

export function insertSiblingsIntoDeck(
    parsedCard: ParsedCard,
    siblingMatches: CardSides[],
    scheduling: RegExpMatchArray[],
    note: TFile,
    ignoreStats: boolean,
    deckPath: string[],
    deckTree: Deck,
    dueDatesFlashcards: Record<number, number>,
    data: PluginData
): { dueDatesFlashcards: Record<number, number> } {
    const cardTextHash: string = cyrb53(parsedCard.cardText);
    let {id, cardText, cardType, lineNo, metadataText: cardMetadata} = parsedCard;
    const fileCachedData = app.metadataCache.getFileCache(note) || {};
    const headings: HeadingCache[] = fileCachedData.headings || [];
    const context: string = data.settings.showContextInCards
        ? getCardContext(lineNo, headings)
        : "";
    const now: number = Date.now();
    const siblings: Card[] = [];
    for (let i = 0; i < siblingMatches.length; i++) {
        const {front, back, clozeInsertionAt} = queryCardSide(siblingMatches[i]);
        const cardObj = new Card(i, scheduling, note, lineNo, front, back, cardText, context, cardType, siblings, clozeInsertionAt);

        // card scheduled
        if (ignoreStats) {
            cardObj.isDue = true;
            deckTree.insertFlashcard([...deckPath], cardObj);
            siblings.push(cardObj);
        } else if (i < scheduling.length) {
            const {interval, ease, due: dueUnix} = generateParsedSchedulingInfo(scheduling, i);
            const nDays: number = Math.ceil((dueUnix - now) / (24 * 3600 * 1000));
            if (!Object.prototype.hasOwnProperty.call(dueDatesFlashcards, nDays)) {
                dueDatesFlashcards[nDays] = 0;
            }
            dueDatesFlashcards[nDays]++;

            if (data.buryList.includes(cardTextHash)) {
                deckTree.countFlashcard([...deckPath]);
            } else if (dueUnix <= now) {
                cardObj.interval = interval;
                cardObj.ease = ease;
                cardObj.delayBeforeReview = now - dueUnix;
                deckTree.insertFlashcard([...deckPath], cardObj);
                siblings.push(cardObj);
            } else {
                deckTree.countFlashcard([...deckPath]);
            }
        } else {
            if (data.buryList.includes(cardTextHash)) {
                deckTree.countFlashcard([...deckPath]);
            } else {
                deckTree.insertFlashcard([...deckPath], cardObj);
                siblings.push(cardObj);
            }
        }
    }
    return { dueDatesFlashcards };
}

function findDeckPath(note: TFile, data: PluginData): string[] {
    let deckPath: string[] = [];
    if (data.settings.convertFoldersToDecks) {
        deckPath = note.path.split("/");
        deckPath.pop(); // remove filename
        if (deckPath.length === 0) {
            deckPath = ["/"];
        }
    } else {
        const fileCachedData = app.metadataCache.getFileCache(note) || {};
        const tags = getAllTags(fileCachedData) || [];

        outer: for (const tagToReview of data.settings.flashcardTags) {
            for (const tag of tags) {
                if (tag === tagToReview || tag.startsWith(tagToReview + "/")) {
                    deckPath = tag.substring(1).split("/");
                    break outer;
                }
            }
        }
    }

    return deckPath;
}