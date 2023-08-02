import React from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";
import {DeckCounts} from "src/routes/notes-home-page";
import {book, Count, Counts} from "src/data/models/book";
import {getBookById} from "src/controller";
import {USE_ACTUAL_BACKEND} from "src/routes/review";

export function deckLoader({params}: {params: any}) {
    if (USE_ACTUAL_BACKEND)
        return getBookById(params.bookId);
    else
        return fetch(`http://localhost:3000/books/${params.bookId}`);
}

export interface DeckLand {
    id: string;
    name: string;
    counts: Counts;
}

export function DeckLandingPage() {
    const book = useLoaderData() as DeckLand;
    const counts = countTotals(book.counts);
    return (
        <>
            <h3>
                {book.name}
            </h3>
            <h4>
                <DeckCounts counts={book.counts.flashcards}/>
            </h4>
            <h4>
                <span
                    // aria-label={t(this.props.cardType)}
                    className={`tree-item-flair sr-deck-counts `}
                    // backgroundColor="#4caf50"
                >
                    {counts.countWith}
                </span>
                    <span
                        // aria-label={t(this.props.cardType)}
                        className={`tree-item-flair sr-deck-counts `}
                        // backgroundColor="#4caf50"
                    >
                    {counts.countWithout}
                </span>
            </h4>
            {/*    TODO: Add the untested highlight counts as well?*/}
            <p>
                <Link to={`chapters`}>
                    <button>
                        Create New Cards
                    </button>
                </Link>
                <Link to={"review"}>
                    <button>
                        Review
                    </button>
                </Link>
            </p>
        </>
    )
}

function countTotals(book: Counts) {
    let countWith: number = 0;
    let countWithout: number = 0;
    for (let sectionKey of Object.keys(book.sections)) {
        //@ts-ignore
        const item: Count = book.counts.sections[sectionKey];
        countWith += item.with;
        countWithout += item.without;
    }
    return {countWith, countWithout};
}