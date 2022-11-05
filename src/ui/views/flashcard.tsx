import {TFile} from "obsidian";
import React, {useContext, useRef, useState} from "react";
import {LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR} from "src/constants";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {AppContext} from "src/contexts/PluginContext";
import {Deck} from "src/Deck";
import {PluginData} from "src/main";
import {Card, ReviewResponse, schedule} from "src/scheduling";
import {escapeRegexString} from "src/utils";
import {FlashcardContent, FlashcardProps} from "../components/flashcard";
import {FlashcardEditModal} from "../modals/edit-modal";
import {ModalStates} from "./modal";

export function FlashcardView(props: FlashcardProps) {
    const [isQuestion, setIsQuestion] = useState(true);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const deck: Deck = props.deck;
    const flashcardList = useRef(generateFlashcardList(deck));
    const pluginContext = useContext(AppContext);
    const { data, easeByPath, dueDatesFlashcards } = pluginContext;

    async function edit(currentCard: Card) {
        let modifiedCard: Card = await FlashcardEditModal.Prompt(pluginContext, currentCard);
        if (modifiedCard !== currentCard) {
            await writeCardBackToFile(currentCard, modifiedCard, modifiedCard.note);
        }
        moveToNextFlashcard();
    }

    async function handleResponseButtons(clickedResponse: ReviewResponse) {
        // todo: move to useEffect?
        await processReview(clickedResponse, flashcardList.current[flashcardIndex], data, dueDatesFlashcards, easeByPath);
        moveToNextFlashcard();
    }

    function moveToNextFlashcard() {
        if (flashcardIndex + 1 < flashcardList.current.length) {
            setFlashcardIndex(flashcardIndex + 1);
            setIsQuestion(true);
        } else {
            props.changeModalStatus(ModalStates.DECK_NOT_IN_REVIEW);
        }
    }

    return (
        <>
            <FlashcardContext.Provider
                value={{
                    handleShowAnswerButton: () => setIsQuestion(false),
                    handleFlashcardResponse: (t: ReviewResponse) => handleResponseButtons(t),
                    isQuestion: isQuestion,
                    card: flashcardList.current[flashcardIndex]
                }}
            >
                <FlashcardContent
                    flashcardEditLater={() => edit(flashcardList.current[flashcardIndex])}
                />
            </FlashcardContext.Provider>
        </>
    );
}

export function removeSchedTextFromCard(cardText: string) {
    return cardText.replace(/<!--SR:.+-->/gm, "");
}

function generateSchedInfoString(scheduling: RegExpMatchArray[]) {
    let schedInfo = "<!--SR:";
    for (let i = 0; i < scheduling.length; i++) {
        schedInfo += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
    }
    schedInfo += "-->";
    return schedInfo;
}

function generateCardTextWithSchedInfo(cardText: string, scheduling: RegExpMatchArray[]) {
    cardText = removeSchedTextFromCard(cardText);
    let schedInfo = generateSchedInfoString(scheduling);
    return cardText+schedInfo;
}

function generateSeparator(cardText: string, isCardCommentOnSameLine: boolean) {
    let sep: string = isCardCommentOnSameLine ? " " : "\n";
    // Override separator if last block is a codeblock
    if (cardText.endsWith("```") && sep !== "\n") {
        sep = "\n";
    }
    return sep;
}

function generateSchedulingArray(cardText: string, dueString: string, interval: number, ease: number, currentCard: Card) {
    let scheduling: RegExpMatchArray[] = [
        ...cardText.matchAll(MULTI_SCHEDULING_EXTRACTOR),
    ];
    if (scheduling.length === 0) {
        scheduling = [...cardText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];
    }

    const currCardSched: RegExpMatchArray = ["0", dueString, interval.toString(), ease.toString()];
    if (currentCard.isDue) {
        scheduling[currentCard.siblingIdx] = currCardSched;
    } else {
        scheduling.push(currCardSched);
    }
    return scheduling;
}

function regenerateCardTextWithSchedInfo(cardText: string, sep: string, dueString: string, interval: number, ease: number, currentCard: Card) {
    // adding info to the card for the first time
    if (cardText.lastIndexOf("<!--SR:") === -1) {
        return cardText + sep + `<!--SR:!${dueString},${interval},${ease}-->`;
    } else {
        let scheduling = generateSchedulingArray(cardText, dueString, interval, ease, currentCard);
        return generateCardTextWithSchedInfo(cardText, scheduling);
    }
}

function updateCardText(currentCard: Card, data: PluginData, dueString: string, interval: number, ease: number, isCardCommentOnSameLine: boolean = data.settings.cardCommentOnSameLine) {
    let cardText = currentCard.cardText;
    const sep = generateSeparator(cardText, isCardCommentOnSameLine);
    return regenerateCardTextWithSchedInfo(cardText, sep, dueString, interval, ease, currentCard);
}

function updateFileTextForCard(currentCard: Card, fileText: string, cardText: string) {
    const replacementRegex = new RegExp(escapeRegexString(currentCard.cardText), "gm");
    return fileText.replace(replacementRegex, () => cardText);
}

async function writeBack(currentCard: Card, fileText: string) {
    await this.app.vault.modify(currentCard.note, fileText);
}

async function processReview(response: ReviewResponse, currentCard: Card, data: PluginData, dueDatesFlashcards: Record<number, number>, easeByPath: Record<string, number>): Promise<void> {
    let interval: number, ease: number, due;

    if (response !== ReviewResponse.Reset) {
        let schedObj: Record<string, number>;
        // scheduled card
        if (currentCard.isDue) {
            schedObj = schedule(
                response,
                currentCard.interval,
                currentCard.ease,
                currentCard.delayBeforeReview,
                data.settings,
                dueDatesFlashcards
            );
        } else {
            let initial_ease: number = data.settings.baseEase;
            if (
                Object.prototype.hasOwnProperty.call(
                    easeByPath,
                    currentCard.note.path
                )
            ) {
                initial_ease = Math.round(easeByPath[currentCard.note.path]);
            }

            schedObj = schedule(
                response,
                1.0,
                initial_ease,
                0,
                data.settings,
                dueDatesFlashcards
            );
            interval = schedObj.interval;
            ease = schedObj.ease;
        }

        interval = schedObj.interval;
        ease = schedObj.ease;
        due = window.moment(Date.now() + interval * 24 * 3600 * 1000);
    } else {
        // due = this.resetFlashcard(due);
        return;
    }

    let updatedCardText = updateCardText(currentCard, data, due.format("YYYY-MM-DD"), interval, ease);

    let fileText: string = await this.app.vault.read(currentCard.note);
    fileText = updateFileTextForCard(currentCard, fileText, updatedCardText);

    for (const sibling of currentCard.siblings) {
        sibling.cardText = updatedCardText;
    }
    if (data.settings.burySiblingCards) {
        // this.burySiblingCards(true);
    }
    await writeBack.call(this, currentCard, fileText);
}

function generateFlashcardList(deck: Deck) {
    let currentDeck = deck;
    let stack: Deck[] = [];
    let flashcards: Card[] = [];
    while (stack || currentDeck) {
        flashcards.push(...currentDeck.newFlashcards);
        flashcards.push(...currentDeck.dueFlashcards);
        if (currentDeck.subdecks.length) {
            stack.push(...currentDeck.subdecks);
        }
        currentDeck = stack.pop();
        if (!currentDeck) {
            break;
        }
    }
    return flashcards;
}

async function writeCardBackToFile(currentCard: Card, updatedCard: Card, file: TFile) {
    let fileText = await app.vault.read(file);
    fileText = updateFileTextForCard(currentCard, fileText, updatedCard.cardText);
    await writeBack.call(this, currentCard, fileText);
}