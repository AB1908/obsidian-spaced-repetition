import { t } from "src/lang/helpers";
import React, { useEffect, useRef, useState } from "react";
import { sync } from "src/DeckBuilder";
import { Deck } from "src/Deck";
import { PluginData } from "src/main";
import { Card, ReviewResponse } from "src/scheduling";
import { DeckTreeView as DeckTreeView } from "./deck";
import { AllDecks } from "./card-counts";
import { Flashcard } from "./flashcard";

interface ModalContainerProps {
    deckTree: Deck;
    startReviewingDeck: Function;
    processFlashcardAnswer: Function;
    currentDeck: Deck;
    isDeckInReview: ModalStates;
    changeModalState: Function;
}

interface ContainerProps {
    handleCloseButtonClick: Function;
    processFlashcardAnswer: Function;
    pluginData: PluginData;
}

export enum ModalStates {
    DECK_IN_REVIEW,
    DECK_NOT_IN_REVIEW,
}

export function ModalElement(props: ContainerProps) {
    const deckTree = useRef(new Deck("root", null));
    const [ignoreStats, setIgnoreStats] = useState(false);
    const [modalState, setModalState] = useState(ModalStates.DECK_NOT_IN_REVIEW);
    const deckBeingReviewed = useRef(null);
    const [syncLock, setSyncLock] = useState(false);

    useEffect(() => {
        const syncDeck = async () => {
            if (modalState == ModalStates.DECK_NOT_IN_REVIEW)
                deckTree.current = await sync(syncLock, setSyncLock, deckTree.current, props.pluginData);
        }
        syncDeck();
    }, [modalState]);

    return (
        <>
            <div
                className="modal-close-button"
                onClick={() => props.handleCloseButtonClick()}
            />
            <div className="modal-title">
                <AllDecks
                    deck={deckTree.current}
                    localizedModalTitle={t("DECKS")}
                />
            </div>
            <div
                className="modal-content sr-modal-content"
                style={{ position: "relative", height: "92%" }}
            >
                <ModalContent
                    startReviewingDeck={(deck: Deck) => {
                        if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0)
                            setModalState(ModalStates.DECK_IN_REVIEW);
                        deckBeingReviewed.current = deck;
                    }}
                    changeModalState={(state: ModalStates) => setModalState(state)}
                    processFlashcardAnswer={async (response: ReviewResponse, card: Card) =>
                        await props.processFlashcardAnswer(response, card)
                    }
                    currentDeck={deckBeingReviewed.current}
                    isDeckInReview={modalState}
                    deckTree={deckTree.current}
                />
            </div>
        </>
    );
}

export function ModalContent(props: ModalContainerProps) {
    if (props.isDeckInReview == ModalStates.DECK_IN_REVIEW) {
        // TODO: Fix
        return (
            <Flashcard
                deck={props.currentDeck}
                processReview={async (a: ReviewResponse, b: Card) =>
                    await props.processFlashcardAnswer(a, b)
                }
                changeModalStatus={(a: ModalStates) => props.changeModalState(a)}
            />
        );
    } else if (props.deckTree && props.isDeckInReview == ModalStates.DECK_NOT_IN_REVIEW) {
        return (
            <DeckTreeView
                subdecksArray={props.deckTree.subdecks}
                deckName={props.deckTree.deckName}
                startReviewingDeck={(deck: Deck) => props.startReviewingDeck(deck)}
            />
        );
    } else {
        return <></>;
    }
}