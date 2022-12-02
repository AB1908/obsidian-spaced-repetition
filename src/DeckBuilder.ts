import {getAllTags, HeadingCache, TFile} from "obsidian";
import {LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR} from "./constants";
import {Deck} from "./Deck";
import {t} from "./lang/helpers";
import {LinkStat, PluginData} from "./main";
import {parse} from "./parser";
import {CardInterface, CardType} from "./scheduling";
import {SRSettings} from "./settings";
import {Stats} from "./stats-modal";
import {cyrb53, escapeRegexString} from "./utils";
import {CardClass} from "src/Card";

//TODO: Also include decks that don't have due flashcards
export async function sync(syncLock: boolean, setSyncLock: Function, data: PluginData): Promise<Deck> {
    let incomingLinks: Record<string, LinkStat[]> = {};
    let dueDatesFlashcards: Record<number, number> = {}; // Record<# of days in future, due count>
    let easeByPath: Record<string, number> = {};

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
            const flashcardsInNoteAvgEase: number = await findFlashcardsInNote(
                note,
                deckPath,
                data,
                deckTree,
                cardStats,
                dueDatesFlashcards
            );

            if (flashcardsInNoteAvgEase > 0) {
                easeByPath[note.path] = flashcardsInNoteAvgEase;
            }
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
        if (shouldIgnore) {
            continue;
        }
    }

    // sort the deck names
    deckTree.sortSubdecksList();
    if (data.settings.showDebugMessages) {
        console.log(`SR: ${t("EASES")}`, easeByPath);
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
    console.log(deckTree);
    return deckTree;
}

export function generateSiblingMatchArray(settings: SRSettings, cardText: string): [string, string][] {
    return findSiblingMatches(generateSiblings(settings, cardText), cardText);
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
    const fileCachedData = app.metadataCache.getFileCache(note) || {};
    const headings: HeadingCache[] = fileCachedData.headings || [];
    let fileChanged = false,
        totalNoteEase = 0,
        scheduledCount = 0;
    const settings: SRSettings = data.settings;
    const noteDeckPath = deckPath;

    const now: number = Date.now();
    const parsedCards: [CardType, string, number][] = parse(
        fileText,
        settings.singlelineCardSeparator,
        settings.singlelineReversedCardSeparator,
        settings.multilineCardSeparator,
        settings.multilineReversedCardSeparator,
        settings.convertHighlightsToClozes,
        settings.convertBoldTextToClozes,
        settings.convertCurlyBracketsToClozes
    );
    for (const parsedCard of parsedCards) {
        deckPath = noteDeckPath;
        const cardType: CardType = parsedCard[0],
            lineNo: number = parsedCard[2];
        let cardText: string = parsedCard[1];

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

        const cardTextHash: string = cyrb53(cardText);

        if (buryOnly) {
            data.buryList.push(cardTextHash);
            continue;
        }

        const siblingMatches: [string, string][] = [];
        if (cardType === CardType.Cloze) {
            const findSiblingMatches1 = generateSiblingMatchArray(settings, cardText);
            siblingMatches.push(...findSiblingMatches1)
        } else {
            let idx: number;
            if (cardType === CardType.SingleLineBasic) {
                idx = cardText.indexOf(settings.singlelineCardSeparator);
                siblingMatches.push([
                    cardText.substring(0, idx),
                    cardText.substring(idx + settings.singlelineCardSeparator.length),
                ]);
            } else if (cardType === CardType.SingleLineReversed) {
                idx = cardText.indexOf(settings.singlelineReversedCardSeparator);
                const side1: string = cardText.substring(0, idx),
                    side2: string = cardText.substring(
                        idx + settings.singlelineReversedCardSeparator.length
                    );
                siblingMatches.push([side1, side2]);
                siblingMatches.push([side2, side1]);
            } else if (cardType === CardType.MultiLineBasic) {
                idx = cardText.indexOf("\n" + settings.multilineCardSeparator + "\n");
                siblingMatches.push([
                    cardText.substring(0, idx),
                    cardText.substring(idx + 2 + settings.multilineCardSeparator.length),
                ]);
            } else if (cardType === CardType.MultiLineReversed) {
                idx = cardText.indexOf("\n" + settings.multilineReversedCardSeparator + "\n");
                const side1: string = cardText.substring(0, idx),
                    side2: string = cardText.substring(
                        idx + 2 + settings.multilineReversedCardSeparator.length
                    );
                siblingMatches.push([side1, side2]);
                siblingMatches.push([side2, side1]);
            }
        }

        let scheduling: RegExpMatchArray[] = [...cardText.matchAll(MULTI_SCHEDULING_EXTRACTOR)];
        if (scheduling.length === 0)
            scheduling = [...cardText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];

        // we have some extra scheduling dates to delete
        if (scheduling.length > siblingMatches.length) {
            const idxSched: number = cardText.lastIndexOf("<!--SR:") + 7;
            let newCardText: string = cardText.substring(0, idxSched);
            for (let i = 0; i < siblingMatches.length; i++)
                newCardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
            newCardText += "-->";

            const replacementRegex = new RegExp(escapeRegexString(cardText), "gm");
            fileText = fileText.replace(replacementRegex, () => newCardText);
            fileChanged = true;
        }

        const context: string = settings.showContextInCards
            ? getCardContext(lineNo, headings)
            : "";
        const siblings: CardInterface[] = [];
        ({ totalNoteEase, scheduledCount, cardStats, dueDatesFlashcards } = createCards(
            siblingMatches,
            scheduling,
            note,
            lineNo,
            cardText,
            context,
            cardType,
            siblings,
            ignoreStats,
            deckPath,
            now,
            totalNoteEase,
            scheduledCount,
            cardTextHash,
            deckTree,
            cardStats,
            dueDatesFlashcards,
            data
        ));
    }

    if (fileChanged) {
        await app.vault.modify(note, fileText);
    }

    if (scheduledCount > 0) {
        const flashcardsInNoteAvgEase: number = totalNoteEase / scheduledCount;
        const flashcardContribution: number = Math.min(
            1.0,
            Math.log(scheduledCount + 0.5) / Math.log(64)
        );
        return (
            flashcardsInNoteAvgEase * flashcardContribution +
            settings.baseEase * (1.0 - flashcardContribution)
        );
    }

    return 0;
}

function generateSiblings(settings: SRSettings, cardText: string) {
    const siblings: RegExpMatchArray[] = [];
    if (settings.convertHighlightsToClozes) {
        siblings.push(...cardText.matchAll(/==(.*?)==/gm));
    }
    if (settings.convertBoldTextToClozes) {
        siblings.push(...cardText.matchAll(/\*\*(.*?)\*\*/gm));
    }
    if (settings.convertCurlyBracketsToClozes) {
        siblings.push(...cardText.matchAll(/{{(.*?)}}/gm));
    }
    siblings.sort((a, b) => {
        if (a.index < b.index) {
            return -1;
        }
        if (a.index > b.index) {
            return 1;
        }
        return 0;
    });
    return siblings;
}

export function generateClozeFront(cardText: string, deletionStart: number, deletionEnd: number) {
    let front =
        `${cardText.substring(0, deletionStart)}<span style='color:#2196f3'>[...]</span>${cardText.substring(deletionEnd)}`;
    return front
        .replace(/==/gm, "")
        .replace(/\*\*/gm, "")
        .replace(/{{/gm, "")
        .replace(/}}/gm, "");
}

function generateClozeBack(back: string, cardText: string, deletionStart: number, deletionEnd: number) {
    back =
        cardText.substring(0, deletionStart) +
        "<span style='color:#2196f3'>" +
        cardText.substring(deletionStart, deletionEnd) +
        "</span>" +
        cardText.substring(deletionEnd);
    return back
        .replace(/==/gm, "")
        .replace(/\*\*/gm, "")
        .replace(/{{/gm, "")
        .replace(/}}/gm, "");
}

function findSiblingMatches(siblings: RegExpMatchArray[], cardText: string): [string, string][] {
    let front: string;
    let back: string;
    let matches: [string, string][] = [];
    for (const m of siblings) {
        const deletionStart: number = m.index,
            deletionEnd: number = deletionStart + m[0].length;
        front = generateClozeFront(cardText, deletionStart, deletionEnd);
        back = generateClozeBack(back, cardText, deletionStart, deletionEnd);
        matches.push([front, back]);
    }
    return matches;
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

function createCards(
    siblingMatches: [string, string][],
    scheduling: RegExpMatchArray[],
    note: TFile,
    lineNo: number,
    cardText: string,
    context: string,
    cardType: CardType,
    siblings: CardInterface[],
    ignoreStats: boolean,
    deckPath: string[],
    now: number,
    totalNoteEase: number,
    scheduledCount: number,
    cardTextHash: string,
    deckTree: Deck,
    cardStats: Stats,
    dueDatesFlashcards: Record<number, number>,
    data: PluginData
): { totalNoteEase: number; scheduledCount: number, cardStats: Stats, dueDatesFlashcards: Record<number, number> } {
    for (let i = 0; i < siblingMatches.length; i++) {
        const front: string = siblingMatches[i][0].trim(),
            back: string = siblingMatches[i][1].trim();
        const cardObj = new CardClass(i, scheduling, note, lineNo, front, back, cardText, context, cardType, siblings);

        // card scheduled
        if (ignoreStats) {
            cardStats.newCount++;
            cardObj.isDue = true;
            deckTree.insertFlashcard([...deckPath], cardObj);
        } else if (i < scheduling.length) {
            const dueUnix: number = window
                .moment(scheduling[i][1], ["YYYY-MM-DD", "DD-MM-YYYY"])
                .valueOf();
            const nDays: number = Math.ceil((dueUnix - now) / (24 * 3600 * 1000));
            if (!Object.prototype.hasOwnProperty.call(dueDatesFlashcards, nDays)) {
                dueDatesFlashcards[nDays] = 0;
            }
            dueDatesFlashcards[nDays]++;

            const interval: number = parseInt(scheduling[i][2]),
                ease: number = parseInt(scheduling[i][3]);
            if (!Object.prototype.hasOwnProperty.call(cardStats.intervals, interval)) {
                cardStats.intervals[interval] = 0;
            }
            cardStats.intervals[interval]++;
            if (!Object.prototype.hasOwnProperty.call(cardStats.eases, ease)) {
                cardStats.eases[ease] = 0;
            }
            cardStats.eases[ease]++;
            totalNoteEase += ease;
            scheduledCount++;

            if (interval >= 32) {
                cardStats.matureCount++;
            } else {
                cardStats.youngCount++;
            }

            if (data.buryList.includes(cardTextHash)) {
                deckTree.countFlashcard([...deckPath]);
                continue;
            }

            if (dueUnix <= now) {
                cardObj.interval = interval;
                cardObj.ease = ease;
                cardObj.delayBeforeReview = now - dueUnix;
                deckTree.insertFlashcard([...deckPath], cardObj);
            } else {
                deckTree.countFlashcard([...deckPath]);
                continue;
            }
        } else {
            cardStats.newCount++;
            if (data.buryList.includes(cyrb53(cardText))) {
                deckTree.countFlashcard([...deckPath]);
                continue;
            }
            deckTree.insertFlashcard([...deckPath], cardObj);
        }

        siblings.push(cardObj);
    }
    return { totalNoteEase, scheduledCount, cardStats, dueDatesFlashcards };
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