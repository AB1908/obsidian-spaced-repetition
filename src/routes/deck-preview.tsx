import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";

export function deckLoader({params}: {params: any}) {
    return fetch(`http://localhost:3000/books/${params.bookId}`);
}

export function DeckLandingPage() {
    const book = useLoaderData() as book;
    const counts = countTotals(book);
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

function countTotals(book: book) {
    let countWith: number = 0;
    let countWithout: number = 0;
    for (let sectionKey of Object.keys(book.counts.sections)) {
        //@ts-ignore
        const item: Count = book.counts.sections[sectionKey];
        countWith += item.with;
        countWithout += item.without;
    }
    return {countWith, countWithout};
}