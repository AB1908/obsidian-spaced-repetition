import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React from "react";
import {Link} from "react-router-dom";
import {routes} from "src/ui/modals/flashcard-modal";

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