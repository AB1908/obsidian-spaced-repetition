import {Deck} from "src/Deck";
import {useLoaderData} from "react-router";
import React, {useEffect, useRef} from "react";
import {setIcon} from "obsidian";
import {Link} from "react-router-dom";
import {AllCardCounts, CardCount} from "src/ui/components/card-counts";
import {Icon} from "src/routes/root";

export interface ReviewBook {
    id:         string;
    name:       string;
    counts: FlashCount;
}

export interface FlashCount {
    mature: number;
    new:    number;
    learning:  number;
}

// TODO: Fix types
// TODO: use more realistic data??
export function notesLoader({params}: {params: any}) {
    return fetch('http://localhost:3000/bookReview');
}

export function Notes() {
    // TODO: rewrite to use props
    const iconRef = useRef(null);
    const deckArray = useLoaderData() as ReviewBook[];

    useEffect(() => {
        const plus: Icon = 'plus-circle';
        setIcon(iconRef.current, plus);
    }, []);

    // TODO: use onClick instead of Link?
    return (
        <div className={"Notes"}>
            <ul className={"sr-deck-tree"}>
                {deckArray.map((book, i) => (
                        <Link to={`/books/${book.id}`}>
                            <li className={"sr-deck tree-item-self is-clickable"} key={i}>
                                <div className={"tree-item-inner"}>
                                    {book.name}
                                </div>
                                <DeckCounts counts={book.counts}/>
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

export function DeckCounts({counts}: {counts: FlashCount}) {
    return (
        <div className="tree-item-flair-outer">
                <span>
                    <CardCount
                        cardType="MATURE"
                        backgroundColor="#4caf50"
                        cardCount={counts.mature}
                        additionalClass={"due-cards"}
                    />
                    <CardCount
                        cardType="NEW"
                        backgroundColor="#2196f3"
                        cardCount={counts.new}
                        additionalClass={"new-cards"}
                    />
                    <CardCount
                        cardType="LEARNING"
                        backgroundColor="#ff7043"
                        cardCount={counts.learning}
                        additionalClass={"total-cards"}
                    />
                </span>
        </div>
    );
}