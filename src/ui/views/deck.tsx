import React, { useState } from "react";
import { Deck } from "src/Deck";
import { AllCardCounts } from "../components/card-counts";

export interface DeckModalProps {
    deckName: string;
    subdecksArray: Deck[];
    startReviewingDeck?: Function;
}

interface SubDeckProps {
    deck: Deck;
    startReviewingDeck?: Function;
}

function InnerTreeItem(props: SubDeckProps) {
    return (
        <div
            className="tree-item-inner"
            onClick={() => { props.startReviewingDeck(props.deck); }}
        >
            {props.deck.deckName}
        </div>
    );
}

function CollapseIcon({ isDeckTreeOpen, handleTriangleClick }: { isDeckTreeOpen: boolean, handleTriangleClick: Function }) {
    return (
        <div
            className="tree-item-icon collapse-icon"
            onClick={(e) => handleTriangleClick(e)}
        >
            <svg
                viewBox="0 0 100 100"
                width={10}
                height={10}
                className="right-triangle"
                style={isDeckTreeOpen ? {} : { transform: "rotate(-90deg)" }}
            >
                <path
                    fill="currentColor"
                    stroke="currentColor"
                    d="M94.9,20.8c-1.4-2.5-4.1-4.1-7.1-4.1H12.2c-3,0-5.7,1.6-7.1,4.1c-1.3,2.4-1.2,5.2,0.2,7.6L43.1,88c1.5,2.3,4,3.7,6.9,3.7 s5.4-1.4,6.9-3.7l37.8-59.6C96.1,26,96.2,23.2,94.9,20.8L94.9,20.8z"
                />
            </svg>
        </div>
    );
}

function CollapsibleDeckTreeEntry(props: SubDeckProps) {
    const [isDeckTreeOpen, setDeckTreeOpen] = useState(false);

    function handleTriangleClick(e: MouseEvent): void {
        e.preventDefault();
        setDeckTreeOpen(!isDeckTreeOpen);
    }

    return (
        <div className="tree-item">
            <details open={isDeckTreeOpen}>
                <summary
                    className="tree-item-self tag-pane-tag is-clickable"
                    onClick={(e) => e.preventDefault()}
                >
                    {/* tree-item-self*/}
                    <CollapseIcon
                        isDeckTreeOpen={isDeckTreeOpen}
                        handleTriangleClick={(e: MouseEvent) => handleTriangleClick(e)}
                    />
                    <InnerTreeItem
                        deck={props.deck}
                        startReviewingDeck={(d: Deck) => props.startReviewingDeck(d)}
                    />
                    <AllCardCounts deck={props.deck} />
                </summary>
                <div className="tree-item-children">
                    <DeckTreeView
                        subdecksArray={props.deck.subdecks}
                        deckName={props.deck.deckName}
                        startReviewingDeck={(d: Deck) => props.startReviewingDeck(d)}
                    />
                </div>
            </details>
        </div>
    );
}

function NonCollapsibleDeckTreeEntry(props: SubDeckProps) {
    return (
        <div className="tree-item">
            <li style={{ display: "contents" }}>
                <div className="tree-item-self tag-pane-tag is-clickable">
                    <InnerTreeItem
                        deck={props.deck}
                        startReviewingDeck={(d: Deck) => props.startReviewingDeck(d)}
                    />
                    <AllCardCounts deck={props.deck} />
                </div>
            </li>
        </div>
    );
}

function DeckTreeEntry(props: SubDeckProps) {
    if (props.deck.subdecks.length) {
        return (
            <CollapsibleDeckTreeEntry
                deck={props.deck}
                startReviewingDeck={(d: Deck) => props.startReviewingDeck(d)}
            />
        );
    } else {
        return (
            <NonCollapsibleDeckTreeEntry
                deck={props.deck}
                startReviewingDeck={(d: Deck) => props.startReviewingDeck(d)}
            />
        );
    }
}

export function DeckTreeView(props: DeckModalProps) {
    const listItems = props.subdecksArray.map((deck: Deck, i: number) => (
        <DeckTreeEntry key={i} deck={deck} startReviewingDeck={(d: Deck) => props.startReviewingDeck(d)} />
    ));
    return <>{listItems}</>;
}