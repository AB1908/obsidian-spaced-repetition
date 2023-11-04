import {useLoaderData} from "react-router";
import React, {useEffect, useRef} from "react";
import {setIcon} from "obsidian";
import {Link} from "react-router-dom";
import {CardCount} from "src/ui/components/card-counts";
import {Icon} from "src/routes/root";
import {getSourcesForReview} from "src/api";
import {USE_ACTUAL_BACKEND} from "src/routes/review";

export interface ReviewBook {
    id:                 string;
    name:               string;
    pendingFlashcards:  number;
    annotationCoverage: number;
    flashcardProgress:  number;
}

export interface FlashCount {
    mature: number;
    new:    number;
    learning:  number;
}

// TODO: Fix types
// TODO: use more realistic data??
export function notesLoader() {
    if (USE_ACTUAL_BACKEND) {
        return getSourcesForReview();
    } else {
        return fetch("http://localhost:3000/bookReview");
    }
}

export function Notes() {
    // TODO: rewrite to use props
    const iconRef = useRef(null);
    const deckArray = useLoaderData() as ReviewBook[];

    useEffect(() => {
        const plus: Icon = "plus-circle";
        // todo: fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(iconRef.current, plus);
    }, []);

    // TODO: use onClick instead of Link?
    return (
        <div className={"Notes"}>
            <ul className={"sr-deck-tree"}>
                {deckArray.map((book, i) => (
                        <Link to={`/books/${book.id}`} key={book.id}>
                            <li className={"sr-deck tree-item-self is-clickable"} key={i}>
                                <div className={"tree-item-inner"}>
                                    {book.name}
                                </div>
                                <div className={"coverage-stats"}>
                                    <PendingFlashcardCount count={book.pendingFlashcards}/>
                                    <CoverageBadge coverageFraction={book.annotationCoverage}/>
                                    <FlashcardProgress progressFraction={book.flashcardProgress}/>
                                </div>
                            </li>
                        </Link>
                    )
                )}
            </ul>
            <Link to={"create"}>
                <button className={"create-deck"}>
                    <div ref={iconRef}></div>
                    Add new deck
                </button>
            </Link>
        </div>
    );
}

export function DeckCounts({counts}: {counts: FlashCount}) {
    return (
        <div className="tree-item-flair-outer">
                <span>
                    <CardCount
                        cardType="MATURE"
                        cardCount={counts.mature}
                        additionalClass={"due-cards"}
                    />
                    <CardCount
                        cardType="NEW"
                        cardCount={counts.new}
                        additionalClass={"new-cards"}
                    />
                    <CardCount
                        cardType="LEARNING"
                        cardCount={counts.learning}
                        additionalClass={"total-cards"}
                    />
                </span>
        </div>
    );
}