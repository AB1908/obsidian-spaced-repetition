import {Deck} from "src/Deck";
import {useLoaderData} from "react-router";
import React, {useEffect, useRef} from "react";
import {setIcon} from "obsidian";
import {Link} from "react-router-dom";
import {AllCardCounts} from "src/ui/components/card-counts";
import {Icon} from "src/routes/root";

export interface ReviewBook {
    id:         string;
    name:       string;
    flashcards: FlashCount;
}

export interface FlashCount {
    mature: number;
    new:    number;
    young:  number;
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
                                {/*<AllCardCounts deck={book}/>*/}
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