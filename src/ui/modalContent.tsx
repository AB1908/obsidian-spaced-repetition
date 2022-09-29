import { t } from "src/lang/helpers";
import React, { useEffect, useRef, useState } from "react";
import { sync } from "src/DeckBuilder";
import { Deck } from "src/flashcard-modal";
import { PluginData } from "src/main";
import { Card, ReviewResponse } from "src/scheduling";
import { DeckTree } from "./deck";
import { AllDecks } from "./deckList";
import { Flashcard } from "./flashcard";

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

export function ModalElement(props: ContainerProps) {
    const deckTree = useRef(new Deck("root", null));
    const [ignoreStats, setIgnoreStats] = useState(false);
    const [modalState, setModalState] = useState(ModalStates.deckNotInReview);
    const deckBeingReviewed = useRef(null);
    const [syncLock, setSyncLock] = useState(false);

    useEffect(() => {
        const syncDeck = async () => {
            if (modalState == ModalStates.deckNotInReview)
                deckTree.current = await sync(syncLock, setSyncLock, deckTree.current, props.data);
        }
        syncDeck();
    }
        , [modalState]);

    console.log("inside modalEl", deckTree)

    return (
        <>
            {/* <div className="modal-bg" style={{ opacity: 0.85 }}></div> */}
            {/* <div className="modal" style={{ height: "80%", width: "40%" }}> */}
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
                    handleClick={(deck: Deck) => {
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
        </>
    );
}