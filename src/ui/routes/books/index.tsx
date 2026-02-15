import {useLoaderData} from "react-router";
import React, {useEffect, useRef} from "react";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { Link } from "react-router-dom";
import { CardCount } from "src/ui/components/card-counts";
import { Icon } from "src/types/obsidian-icons";
import { getSourcesForReview, ReviewBook, FlashCount } from "src/api";
import { USE_JSON_MOCK } from "src/ui/routes/books/review";
import { maturityCounts } from "src/data/models/flashcard";

// TODO: Fix types
// TODO: use more realistic data??
export function notesLoader() {
    if (!USE_JSON_MOCK) {
        return getSourcesForReview();
    } else {
        return fetch("http://localhost:3000/books");
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
        // @ts-ignore
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
                                <div className={"tree-item-outer"}>
                                    <PendingFlashcardCount count={book.pendingFlashcards}/>
                                    <FlashcardProgress progressFraction={book.annotationCoverage} flashcardsCount={book.flashcardProgress}/>
                                </div>
                            </li>
                        </Link>
                    )
                )}
            </ul>
            <Link to={"create"}>
                <button className={"create-deck mod-cta sr-button"}>
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

function FlashcardProgress({progressFraction, flashcardsCount}: {progressFraction: number, flashcardsCount: ReturnType<typeof maturityCounts>}) {
    const {learning, mature, new: newCount} = flashcardsCount;
    let totalFlashcardsCount = mature + learning + newCount;
    let number = (newCount+learning)*100/totalFlashcardsCount;
    let number1 = newCount*100/totalFlashcardsCount;
    return <div className={"progress"}>
        <div style={{
                width: `${progressFraction*100}%`,
                backgroundImage: `linear-gradient(90deg,#f28f68 ${number1}%,#8bcf69 ${number1}%,#8bcf69 ${number}%,#719fd1 ${number}%,#719fd1 100%)`,
            }}
        >
        </div>
    </div>;
}

function PendingFlashcardCount(props: { count: number }) {
    return <div className={"pending-flashcard-count"}>
        <span>
            <span>
                {props.count}
            </span>
        </span>
    </div>;
}
