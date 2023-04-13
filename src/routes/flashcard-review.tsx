import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React, {useContext, useEffect, useRef, useState} from "react";
import {DeckTreeView} from "src/ui/views/deck";
import {sync} from "src/DeckBuilder";
import {AppContext} from "src/contexts/PluginContext";
import {Outlet, useNavigate} from "react-router";
import {Link, NavLink} from "react-router-dom";

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