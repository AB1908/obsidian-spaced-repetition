import { FrontMatterCache, getAllTags, HeadingCache, TFile } from "obsidian";
import { t } from "src/lang/helpers";
import { ReviewDeck } from "src/review-deck";
// import { ReviewResponse } from "src/scheduling";
import React, { useEffect, useRef, useState } from "react";
import { LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR } from "src/constants";
import { Deck } from "src/flashcard-modal";
import { LinkStat, PluginData } from "src/main";
import { parse } from "src/parser";
import { Card, CardType, ReviewResponse } from "src/scheduling";
import { SRSettings } from "src/settings";
import { Stats } from "src/stats-modal";
import { cyrb53, escapeRegexString } from "src/utils";
import { DeckTree } from "./deck";
import { AllDecks } from "./deckList";
import { Flashcard } from "./flashcard";

// export interface ModalState {
//     deckInReview: boolean;
//     currentDeck: Deck;
//     ignoreStats: boolean;
// }

interface ModalContainerProps {
    deckTree: Deck;
    handleClick: Function;
    processReview: Function;
    currentDeck: Deck;
    isDeckInReview: ModalStates;
    changeModalState: Function;
}

export function ModalContent(props: ModalContainerProps) {
    if (props.isDeckInReview == ModalStates.deckInReview) {
        console.log("deck in review indeed");
        // TODO: Fix
        return (
            <Flashcard
                deck={props.currentDeck}
                processReview={async (a: ReviewResponse, b: Card) =>
                    await props.processReview(a, b)
                }
                changeModalStatus={(a: ModalStates) => props.changeModalState(a)}
            />
        );
    } else if (props.deckTree && props.isDeckInReview == ModalStates.deckNotInReview) {
        console.log("deck not in review, trying to display tree");
        return (
            <DeckTree
                subdecksArray={props.deckTree.subdecks}
                deckName={props.deckTree.deckName}
                handleClick={(deck: Deck) => props.handleClick(deck)}
            />
        );
    } else {
        return <></>;
    }
}

interface ContainerProps {
    handleCloseButtonClick: Function;
    processReview: Function;
    data: PluginData;
}

export enum ModalStates {
    deckInReview,
    deckNotInReview,
}

export function ModalContainer(props: ContainerProps) {
    const deckTree = useRef(new Deck("root", null));
    const [ignoreStats, setIgnoreStats] = useState(false);
    const [modalState, setModalState] = useState(ModalStates.deckNotInReview);
    // const [deckBeingReviewed, setDeckBeingReviewed] = useRef(null);
    const deckBeingReviewed = useRef(null);
    // const [deckState, setDeckState] = useState({
    //     deckInReview: false,
    //     currentDeck: null
    // });
    const [syncLock, setSyncLock] = useState(false);
    let incomingLinks: Record<string, LinkStat[]> = {};
    let data: PluginData = props.data;
    // let dueDatesNotes: Record<number, number> = {}; // Record<# of days in future, due count>
    let dueNotesCount = 0;
    let reviewDecks: { [deckKey: string]: ReviewDeck } = {};
    let pageranks: Record<string, number> = {};
    let dueDatesFlashcards: Record<number, number> = {}; // Record<# of days in future, due count>
    // deckTree.current = new Deck("root", null);
    let easeByPath: Record<string, number> = {};
    let cardStats: Stats;
    // easeByPath = {};
    // incomingLinks = {};
    // pageranks = {};
    // dueNotesCount = 0;
    // dueDatesNotes = {};
    // reviewDecks = {};

    // reset flashcards stuff
    // deckTree = new Deck("root", null);
    // dueDatesFlashcards = {};
    cardStats = {
        eases: {},
        intervals: {},
        newCount: 0,
        youngCount: 0,
        matureCount: 0,
    };

    async function sync(): Promise<void> {
        if (syncLock) {
            return;
        }
        setSyncLock(true);
        deckTree.current = new Deck("root", null);

        // reset notes stuff
        // graph.reset();
        // const easeByPath = {};
        // const incomingLinks = {};
        // pageranks = {};
        // dueNotesCount = 0;
        // dueDatesNotes = {};
        // let reviewDecks = {};

        // reset flashcards stuff
        // const dueDatesFlashcards = {};
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
                    data
                );

                if (flashcardsInNoteAvgEase > 0) {
                    easeByPath[note.path] = flashcardsInNoteAvgEase;
                }
            }

            const fileCachedData = app.metadataCache.getFileCache(note) || {};

            const frontmatter: FrontMatterCache | Record<string, unknown> =
                fileCachedData.frontmatter || {};
            const tags = getAllTags(fileCachedData) || [];

            let shouldIgnore = true;
            const matchedNoteTags = [];

            for (const tagToReview of data.settings.tagsToReview) {
                if (tags.some((tag) => tag === tagToReview || tag.startsWith(tagToReview + "/"))) {
                    if (!Object.prototype.hasOwnProperty.call(reviewDecks, tagToReview)) {
                        reviewDecks[tagToReview] = new ReviewDeck(tagToReview);
                    }
                    matchedNoteTags.push(tagToReview);
                    shouldIgnore = false;
                    break;
                }
            }
            if (shouldIgnore) {
                continue;
            }

            // file has no scheduling information
            if (
                !(
                    Object.prototype.hasOwnProperty.call(frontmatter, "sr-due") &&
                    Object.prototype.hasOwnProperty.call(frontmatter, "sr-interval") &&
                    Object.prototype.hasOwnProperty.call(frontmatter, "sr-ease")
                )
            ) {
                for (const matchedNoteTag of matchedNoteTags) {
                    reviewDecks[matchedNoteTag].newNotes.push(note);
                }
                continue;
            }

            const dueUnix: number = window
                .moment(frontmatter["sr-due"], ["YYYY-MM-DD", "DD-MM-YYYY", "ddd MMM DD YYYY"])
                .valueOf();

            for (const matchedNoteTag of matchedNoteTags) {
                reviewDecks[matchedNoteTag].scheduledNotes.push({ note, dueUnix });
                if (dueUnix <= now.valueOf()) {
                    reviewDecks[matchedNoteTag].dueNotesCount++;
                }
            }

            if (Object.prototype.hasOwnProperty.call(easeByPath, note.path)) {
                easeByPath[note.path] = (easeByPath[note.path] + frontmatter["sr-ease"]) / 2;
            } else {
                easeByPath[note.path] = frontmatter["sr-ease"];
            }

            if (dueUnix <= now.valueOf()) {
                dueNotesCount++;
            }

            const nDays: number = Math.ceil((dueUnix - now.valueOf()) / (24 * 3600 * 1000));
            // if (!Object.prototype.hasOwnProperty.call(dueDatesNotes, nDays)) {
            // dueDatesNotes[nDays] = 0;
            // }
            // dueDatesNotes[nDays]++;
        }

        // graph.rank(0.85, 0.000001, (node: string, rank: number) => {
        // pageranks[node] = rank * 10000;
        // });

        // sort the deck names
        deckTree.current.sortSubdecksList();
        if (data.settings.showDebugMessages) {
            console.log(`SR: ${t("EASES")}`, easeByPath);
            console.log(`SR: ${t("DECKS")}`, deckTree);
        }

        for (const deckKey in reviewDecks) {
            reviewDecks[deckKey].sortNotes(pageranks);
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
        console.log("did sync");
    }

    async function findFlashcardsInNote(
        note: TFile,
        deckPath: string[],
        data: PluginData,
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

            deckTree.current.createDeck([...deckPath]);

            const cardTextHash: string = cyrb53(cardText);

            if (buryOnly) {
                data.buryList.push(cardTextHash);
                continue;
            }

            const siblingMatches: [string, string][] = [];
            if (cardType === CardType.Cloze) {
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

                let front: string, back: string;
                for (const m of siblings) {
                    const deletionStart: number = m.index,
                        deletionEnd: number = deletionStart + m[0].length;
                    front =
                        cardText.substring(0, deletionStart) +
                        "<span style='color:#2196f3'>[...]</span>" +
                        cardText.substring(deletionEnd);
                    front = front
                        .replace(/==/gm, "")
                        .replace(/\*\*/gm, "")
                        .replace(/{{/gm, "")
                        .replace(/}}/gm, "");
                    back =
                        cardText.substring(0, deletionStart) +
                        "<span style='color:#2196f3'>" +
                        cardText.substring(deletionStart, deletionEnd) +
                        "</span>" +
                        cardText.substring(deletionEnd);
                    back = back
                        .replace(/==/gm, "")
                        .replace(/\*\*/gm, "")
                        .replace(/{{/gm, "")
                        .replace(/}}/gm, "");
                    siblingMatches.push([front, back]);
                }
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
            const siblings: Card[] = [];
            ({ totalNoteEase, scheduledCount } = createCards(
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
                cardTextHash
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
        siblings: Card[],
        ignoreStats: boolean,
        deckPath: string[],
        now: number,
        totalNoteEase: number,
        scheduledCount: number,
        cardTextHash: string
    ): { totalNoteEase: number; scheduledCount: number } {
        for (let i = 0; i < siblingMatches.length; i++) {
            const front: string = siblingMatches[i][0].trim(),
                back: string = siblingMatches[i][1].trim();

            const cardObj: Card = {
                isDue: i < scheduling.length,
                note,
                lineNo,
                front,
                back,
                cardText,
                context,
                cardType,
                siblingIdx: i,
                siblings,
            };

            // card scheduled
            if (ignoreStats) {
                cardStats.newCount++;
                cardObj.isDue = true;
                deckTree.current.insertFlashcard([...deckPath], cardObj);
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
                    deckTree.current.countFlashcard([...deckPath]);
                    continue;
                }

                if (dueUnix <= now) {
                    cardObj.interval = interval;
                    cardObj.ease = ease;
                    cardObj.delayBeforeReview = now - dueUnix;
                    deckTree.current.insertFlashcard([...deckPath], cardObj);
                } else {
                    deckTree.current.countFlashcard([...deckPath]);
                    continue;
                }
            } else {
                cardStats.newCount++;
                if (data.buryList.includes(cyrb53(cardText))) {
                    deckTree.current.countFlashcard([...deckPath]);
                    continue;
                }
                deckTree.current.insertFlashcard([...deckPath], cardObj);
            }

            siblings.push(cardObj);
        }
        return { totalNoteEase, scheduledCount };
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

    useEffect(() => {
        if (modalState == ModalStates.deckNotInReview) sync();
    }, [modalState]);

    return (
        <>
            <div className="modal-bg" style={{ opacity: 0.85 }}></div>
            <div className="modal" style={{ height: "80%", width: "40%" }}>
                <div
                    className="modal-close-button"
                    onClick={() => props.handleCloseButtonClick()}
                />
                <div className="modal-title">
                    <AllDecks
                        deck={deckTree.current}
                        // ref={deckTreeRef}
                        localizedModalTitle={t("DECKS")}
                    />
                </div>
                <div
                    className="modal-content sr-modal-content"
                    style={{ position: "relative", height: "92%" }}
                >
                    <ModalContent
                        handleClick={(deck: Deck) => {
                            console.log(deck);
                            if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0)
                                setModalState(ModalStates.deckInReview);
                            deckBeingReviewed.current = deck;
                        }}
                        changeModalState={(state: ModalStates) => setModalState(state)}
                        processReview={async (response: ReviewResponse, card: Card) =>
                            await props.processReview(response, card)
                        }
                        currentDeck={deckBeingReviewed.current}
                        isDeckInReview={modalState}
                        deckTree={deckTree.current}
                    />
                </div>
            </div>
        </>
    );
}
