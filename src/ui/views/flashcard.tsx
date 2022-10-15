import React, { useContext, useRef, useState } from "react";
import { LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR } from "src/constants";
import { FlashcardContext } from "src/contexts/FlashcardContext";
import { AppContext } from "src/contexts/PluginContext";
import { Deck } from "src/Deck";
import { PluginData } from "src/main";
import { Card, ReviewResponse, schedule } from "src/scheduling";
import { escapeRegexString } from "src/utils";
import { FlashcardContent, FlashcardProps } from "../components/flashcard";
import { FlashcardEditModal } from "../modals/edit-modal";
import { ModalStates } from "./modal";

export function FlashcardView(props: FlashcardProps) {
    const [isQuestion, setIsQuestion] = useState(true);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const deck: Deck = props.deck;
    const flashcardList = useRef(generateFlashcardList(deck));
    const { data, easeByPath, dueDatesFlashcards } = useContext(AppContext);

    function handleShowAnswerButton() {
        setIsQuestion(false);
    }

    async function edit(currentCard: Card) {
        let textPromptArr = currentCard.cardText.split("\n");
        let textPrompt = "";
        if (textPromptArr[textPromptArr.length - 1].startsWith("<!--SR:")) {
            textPrompt = textPromptArr.slice(0, -1).join("\n");
        } else {
            textPrompt = currentCard.cardText;
        }

        let editModal = FlashcardEditModal.Prompt(this.app, this.plugin, textPrompt);
        editModal
            .then(async (modifiedCardText) => {
                modifyCardText(currentCard, textPrompt, modifiedCardText);
                moveToNextFlashcard();
            })
            .catch((reason) => console.log(reason));
    }

    async function handleResponseButtons(clickedResponse: ReviewResponse) {
        // todo: move to useefect?
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
                    handleShowAnswerButton: handleShowAnswerButton,
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

async function processReview(response: ReviewResponse, currentCard: Card, data: PluginData, dueDatesFlashcards: Record<number, number>, easeByPath: Record<string, number>): Promise<void> {
    if (this.ignoreStats) {
        if (response == ReviewResponse.Easy) {
        }
        return;
    }

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

    const dueString: string = due.format("YYYY-MM-DD");

    let fileText: string = await this.app.vault.read(currentCard.note);
    const replacementRegex = new RegExp(escapeRegexString(currentCard.cardText), "gm");

    let sep: string = data.settings.cardCommentOnSameLine ? " " : "\n";
    // Override separator if last block is a codeblock
    if (currentCard.cardText.endsWith("```") && sep !== "\n") {
        sep = "\n";
    }

    // check if we're adding scheduling information to the flashcard
    // for the first time
    if (currentCard.cardText.lastIndexOf("<!--SR:") === -1) {
        currentCard.cardText =
            currentCard.cardText + sep + `<!--SR:!${dueString},${interval},${ease}-->`;
    } else {
        let scheduling: RegExpMatchArray[] = [
            ...currentCard.cardText.matchAll(MULTI_SCHEDULING_EXTRACTOR),
        ];
        if (scheduling.length === 0) {
            scheduling = [...currentCard.cardText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];
        }

        const currCardSched: RegExpMatchArray = ["0", dueString, interval.toString(), ease.toString()];
        if (currentCard.isDue) {
            scheduling[currentCard.siblingIdx] = currCardSched;
        } else {
            scheduling.push(currCardSched);
        }

        currentCard.cardText = currentCard.cardText.replace(/<!--SR:.+-->/gm, "");
        currentCard.cardText += "<!--SR:";
        for (let i = 0; i < scheduling.length; i++) {
            currentCard.cardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
        }
        currentCard.cardText += "-->";
    }

    fileText = fileText.replace(replacementRegex, () => currentCard.cardText);
    for (const sibling of currentCard.siblings) {
        sibling.cardText = currentCard.cardText;
    }
    if (data.settings.burySiblingCards) {
        // this.burySiblingCards(true);
    }

    await this.app.vault.modify(currentCard.note, fileText);
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

async function modifyCardText(currentCard: Card, originalText: string, replacementText: string) {
    if (!replacementText) return;
    if (replacementText == originalText) return;
    let fileText: string = await this.app.vault.read(currentCard.note);
    const originalTextRegex = new RegExp(escapeRegexString(originalText), "gm");
    fileText = fileText.replace(originalTextRegex, replacementText);
    await this.app.vault.modify(currentCard.note, fileText);
}
