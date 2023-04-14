import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React from "react";
import {Link} from "react-router-dom";

export function DeckLandingPage() {
    const deck1 = {dueFlashcardsCount: 10, newFlashcardsCount:20, totalFlashcards: 30, deckName: "Deck1"} as Deck;
    return (
        <>
            <h3>
                {deck1.deckName}
            </h3>
            <h4>
                <AllCardCounts deck={deck1}/>
            </h4>
            <p>
                <Link to={""}>
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