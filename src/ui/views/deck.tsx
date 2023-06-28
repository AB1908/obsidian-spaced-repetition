import React from "react";
import {Deck} from "src/Deck";
import {AllCardCounts} from "../components/card-counts";

export interface DeckModalProps {
    deck: Deck;
    startReviewingDeck: Function;
}

function InnerTreeItem(props: DeckModalProps) {
    return (
        <div
            className="sr-deck tree-item-inner"
            onClick={() => { props.startReviewingDeck(props.deck); }}
        >
            {props.deck.deckName}
        </div>
    );
}

export function DeckEntry(props: { deck: Deck, startReviewingDeck: (d: Deck) => any }) {
    return <>
        <InnerTreeItem
            deck={props.deck}
            startReviewingDeck={props.startReviewingDeck}
        />
        <AllCardCounts deck={props.deck}/>
    </>;
}