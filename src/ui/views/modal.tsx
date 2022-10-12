import { t } from "src/lang/helpers";
import React, { useContext, useEffect, useRef, useState } from "react";
import { sync } from "src/DeckBuilder";
import { Deck } from "src/Deck";
import { PluginData } from "src/main";
import { DeckTreeView as DeckTreeView } from "./deck";
import { AllDecks } from "../components/card-counts";
import { FlashcardView } from "./flashcard";
import { AppContext } from "src/contexts/PluginContext";

interface ModalContainerProps {
    deckTree: Deck;
    startReviewingDeck: Function;
    currentDeck: Deck;
    isDeckInReview: ModalStates;
    changeModalState: Function;
}

interface ContainerProps {
    handleCloseButtonClick: Function;
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
    const { data } = useContext(AppContext);

    useEffect(() => {
        const syncDeck = async () => {
            if (modalState == ModalStates.DECK_NOT_IN_REVIEW)
                deckTree.current = await sync(syncLock, setSyncLock, data);
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
                {modalState == ModalStates.DECK_NOT_IN_REVIEW &&
                    <AllDecks
                        deck={deckTree.current}
                        localizedModalTitle={t("DECKS")}
                    />
                }
                {modalState == ModalStates.DECK_IN_REVIEW && ("Flashcards")}
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