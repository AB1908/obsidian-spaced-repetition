import { t } from "src/lang/helpers";
import React, { useEffect, useRef, useState } from "react";
import { sync } from "src/DeckBuilder";
import { Deck } from "src/Deck";
import { PluginData } from "src/main";
import { DeckTreeView as DeckTreeView } from "./deck";
import { AllDecks } from "./card-counts";
import { FlashcardView } from "./flashcard";

interface ModalContainerProps {
    deckTree: Deck;
    startReviewingDeck: Function;
    currentDeck: Deck;
    isDeckInReview: ModalStates;
    changeModalState: Function;
    additionalProps: AdditionalProps;
}

interface ContainerProps {
    handleCloseButtonClick: Function;
    additionalProps: AdditionalProps;
}

export interface AdditionalProps {
    pluginData: PluginData;
    dueDatesFlashcards: Record<number, number>;
    easeByPath: Record<string, number>
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
                deckTree.current = await sync(syncLock, setSyncLock, deckTree.current, props.additionalProps.pluginData);
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
                    currentDeck={deckBeingReviewed.current}
                    isDeckInReview={modalState}
                    deckTree={deckTree.current}
                    additionalProps={props.additionalProps}
                />
            </div>
        </>
    );
}

export function ModalContent(props: ModalContainerProps) {
    if (props.isDeckInReview == ModalStates.DECK_IN_REVIEW) {
        // TODO: Fix
        return (
            <FlashcardView
                deck={props.currentDeck}
                changeModalStatus={(a: ModalStates) => props.changeModalState(a)}
                additionalProps={props.additionalProps}
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