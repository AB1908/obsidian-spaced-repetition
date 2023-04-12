import {AllCardCounts, AllDecks} from "src/ui/components/card-counts";
import {t} from "src/lang/helpers";
import {Deck} from "src/Deck";
import React, {useContext, useEffect, useRef, useState} from "react";
import {DeckTreeView} from "src/ui/views/deck";
import {sync} from "src/DeckBuilder";
import {AppContext} from "src/contexts/PluginContext";
import {Outlet, useNavigate} from "react-router";
import {Link, NavLink} from "react-router-dom";
import {setIcon} from "obsidian";

// <>
//     <div
//         className="modal-close-button"
//         onClick={() => props.handleCloseButtonClick()}
//     />
//     <div className="modal-title">
//         {modalState == ModalStates.DECK_NOT_IN_REVIEW &&
//             <AllDecks
//                 deck={deckTree.current}
//                 localizedModalTitle={t("DECKS")}
//             />
//         }
//         {modalState == ModalStates.DECK_IN_REVIEW && ("Flashcards")}
//     </div>
//     <div
//         className="modal-content sr-modal-content"
//         // style={{ position: "relative", height: "92%" }}
//     >
//         <ModalContent
//             startReviewingDeck={(deck: Deck) => {
//                 if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0)
//                     setModalState(ModalStates.DECK_IN_REVIEW);
//                 deckBeingReviewed.current = deck;
//             }}
//             changeModalState={(state: ModalStates) => setModalState(state)}
//             currentDeck={deckBeingReviewed.current}
//             isDeckInReview={modalState}
//             deckTree={deckTree.current}
//         />
//     </div>
// </>


export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    // const router = createBrowserRouter([
    //     {
    //         path: "/index.html",
    //         element: <Root handleCloseButton={()=>this.close()}/>,
    //         errorElement: <ErrorPage />,
    //     },
    // ]);
    const navigate = useNavigate();
    useEffect(() => {
        navigate("/home/tags");
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

enum TabState {
    Notes,
    Tags
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

    return (
        <div className={"Notes"}>
           <ul className={"sr-deck-tree"}>
               { deckArray.map((deck, i)=>(
                   <li className={"sr-deck tree-item-self is-clickable"} key={i}>
                       <div className={"tree-item-inner"}>
                           <Link to={'/notes/deck/1'}>
                               {deck.deckName}
                           </Link>
                       </div>
                       <AllCardCounts deck={deck}/>
                   </li>
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
    const deckTree = useRef(new Deck("root", null));
    const [syncLock, setSyncLock] = useState(false);
    const { data } = useContext(AppContext);

    useEffect(() => {
        const syncDeck = async () => {
                deckTree.current = await sync(syncLock, setSyncLock, data);
        }
        syncDeck();
    }, []);


    console.log(deckTree.current);
    return (
            <DeckTreeView
                subdecksArray={deckTree.current.subdecks}
                deckName={deckTree.current.deckName}
                // startReviewingDeck={(deck: Deck) => startReviewingDeck(deck)}
            />
    );
}

export function FlashcardReview() {
    return (
        <p>Well, this is a let down!</p>
    );
}

export function Flashcard() {
    return (<p>lol</p>);
}