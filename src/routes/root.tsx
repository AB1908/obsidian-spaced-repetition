import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import React, {useContext, useEffect, useRef, useState} from "react";
import {Outlet, useNavigate} from "react-router";
import {Link, NavLink} from "react-router-dom";
import {setIcon} from "obsidian";
import {ICON_LIST} from "src/constants";
import {ModalContent} from "src/ui/views/modal";

export type Icon = typeof ICON_LIST[number];

export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/home/notes");
    }, []);

    return (
        <>
            <div
                className={"modal-close-button"}
                onClick={() => handleCloseButton()}
            />
            <div className={"modal-title"}>
                Spaced Repetition
            </div>
            <div
                className={"modal-content sr-modal-content"}
            >
                <Outlet/>
            </div>
        </>
    );
}

export function Tabs() {
    return (
        <>
            <div className={"sr-tab-nav"}>
                <NavLink to="/home/tags" className={"sr-nav-link is-clickable"} >
                    Tags
                </NavLink>
                <NavLink to="/home/notes" className={"sr-nav-link is-clickable"}>
                    Notes
                </NavLink>
            </div>
            <Outlet/>
        </>
    );
};

// export function Notes({deck}:{deck: Deck}) {
export function Notes() {
    // TODO: rewrite to use props
    const deck1 = {dueFlashcardsCount: 10, newFlashcardsCount:20, totalFlashcards: 30, deckName: "Deck1"} as Deck;
    const deck2 = {dueFlashcardsCount: 40, newFlashcardsCount:40, totalFlashcards: 40, deckName: "Deck2"} as Deck;
    const deckArray = [deck1, deck2];
    const iconRef = useRef(null);

    useEffect(() => {
        const plus: Icon = 'plus-circle';
        setIcon(iconRef.current, plus);
    }, []);

    // TODO: use onClick instead of Link?
    return (
        <div className={"Notes"}>
           <ul className={"sr-deck-tree"}>
               { deckArray.map((deck, i)=>(
                   <Link to={'/notes/deck'}>
                       <li className={"sr-deck tree-item-self is-clickable"} key={i}>
                           <div className={"tree-item-inner"}>
                               {deck.deckName}
                           </div>
                           <AllCardCounts deck={deck}/>
                       </li>
                   </Link>
                   )
               ) }
           </ul>
            <button className={"create-deck"}>
                <div ref={iconRef}></div>
                Add new deck
            </button>
        </div>
    )
}

export function Tags() {
    return <ModalContent/>
}