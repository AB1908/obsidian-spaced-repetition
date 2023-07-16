import {Deck} from "src/Deck";
import {useLoaderData} from "react-router";
import React, {useEffect, useRef} from "react";
import {setIcon} from "obsidian";
import {Link} from "react-router-dom";
import {AllCardCounts} from "src/ui/components/card-counts";
import {Icon} from "src/routes/root";

// TODO: Fix types
export function notesLoader({params}: {params: any}) {
    const deck1 = {dueFlashcardsCount: 10, newFlashcardsCount: 20, totalFlashcards: 30, deckName: "Deck1"} as Deck;
    const deck2 = {dueFlashcardsCount: 40, newFlashcardsCount: 40, totalFlashcards: 40, deckName: "Deck2"} as Deck;
    return [deck1, deck2];
}

export function Notes() {
    // TODO: rewrite to use props
    const iconRef = useRef(null);
    const deckArray = useLoaderData() as Deck[];

    useEffect(() => {
        const plus: Icon = 'plus-circle';
        setIcon(iconRef.current, plus);
    }, []);

    // TODO: use onClick instead of Link?
    return (
        <div className={"Notes"}>
            <ul className={"sr-deck-tree"}>
                {deckArray.map((deck, i) => (
                        <Link to={'/notes/deck'}>
                            <li className={"sr-deck tree-item-self is-clickable"} key={i}>
                                <div className={"tree-item-inner"}>
                                    {deck.deckName}
                                </div>
                                <AllCardCounts deck={deck}/>
                            </li>
                        </Link>
                    )
                )}
            </ul>
            <button className={"create-deck"}>
                <div ref={iconRef}></div>
                Add new deck
            </button>
        </div>
    )
}