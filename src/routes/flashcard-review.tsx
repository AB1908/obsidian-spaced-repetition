import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";

export function deckLoader({params}: {params: any}) {
    console.log(params);
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
                <Link to={""}>
                    <button>
                        Review
                    </button>
                </Link>
            </p>
        </>
    )
}