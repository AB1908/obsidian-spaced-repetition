import React, { useContext, useEffect, useRef, useState } from "react";
import { sync } from "src/DeckBuilder";
import { Deck } from "src/Deck";
import { DeckTreeView as DeckTreeView } from "./deck";
import { FlashcardView } from "./flashcard";
import { AppContext } from "src/contexts/PluginContext";

export enum ModalStates {
    DECK_IN_REVIEW,
    DECK_NOT_IN_REVIEW,
}


export function ModalContent() {
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

    if (modalState == ModalStates.DECK_IN_REVIEW) {
        // TODO: Fix
        return (
            <FlashcardView
                deck={deckBeingReviewed.current}
                changeModalStatus={(state: ModalStates) => setModalState(state)}
            />
        );
    } else if (deckTree && modalState == ModalStates.DECK_NOT_IN_REVIEW) {
        return (
            <DeckTreeView
                deck={deckTree.current}
                startReviewingDeck={(deck: Deck) => {
                    if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0)
                        setModalState(ModalStates.DECK_IN_REVIEW);
                    deckBeingReviewed.current = deck;
                }}
            />
        );
    } else {
        return <></>;
    }
}