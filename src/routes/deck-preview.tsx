import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";

export function deckLoader({params}: {params: any}) {
    return fetch(`http://localhost:3000/books/${params.bookId}`);
}

export function DeckLandingPage() {
    const deck1 = useLoaderData() as Deck;
    return (
        <>
            <h3>
                {deck1.deckName}
            </h3>
            <h4>
                {/*<AllCardCounts deck={deck1}/>*/}
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