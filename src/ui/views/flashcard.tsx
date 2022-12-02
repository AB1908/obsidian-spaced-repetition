import {TFile} from "obsidian";
import React, {useContext, useRef, useState} from "react";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {AppContext} from "src/contexts/PluginContext";
import {Deck} from "src/Deck";
import {PluginData} from "src/main";
import {CardInterface, ReviewResponse, schedule} from "src/scheduling";
import {FlashcardContent, FlashcardProps} from "../components/flashcard";
import {FlashcardEditModal} from "../modals/edit-modal";
import {ModalStates} from "./modal";
import {updateCardInFileText, updateCardText} from "src/sched-utils";

export function FlashcardView(props: FlashcardProps) {
    const [isQuestion, setIsQuestion] = useState(true);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const deck: Deck = props.deck;
    const flashcardList = useRef(generateFlashcardList(deck));
    const pluginContext = useContext(AppContext);
    const { data, easeByPath, dueDatesFlashcards } = pluginContext;

    async function edit(currentCard: CardInterface) {
        let modifiedCard: CardInterface = await FlashcardEditModal.Prompt(pluginContext, currentCard);
        if (modifiedCard !== currentCard) {
            await writeCardBackToFile(currentCard, modifiedCard, modifiedCard.note);
            moveToNextFlashcard();
        }
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

async function writeBack(currentCard: CardInterface, fileText: string) {
    await this.app.vault.modify(currentCard.note, fileText);
}

async function processReview(response: ReviewResponse, currentCard: CardInterface, data: PluginData, dueDatesFlashcards: Record<number, number>, easeByPath: Record<string, number>): Promise<void> {
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

    let updatedCardText = updateCardText(currentCard, due.format("YYYY-MM-DD"), interval, ease, data.settings.cardCommentOnSameLine);

    let fileText: string = await this.app.vault.read(currentCard.note);
    fileText = updateCardInFileText(currentCard, fileText, updatedCardText);

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
    let flashcards: CardInterface[] = [];
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

async function writeCardBackToFile(currentCard: CardInterface, updatedCard: CardInterface, file: TFile) {
    let fileText = await app.vault.read(file);
    fileText = updateCardInFileText(currentCard, fileText, updatedCard.cardText);
    await writeBack.call(this, currentCard, fileText);
}