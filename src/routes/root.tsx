import {AllCardCounts, AllDecks} from "src/ui/components/card-counts";
import {t} from "src/lang/helpers";
import {Deck} from "src/Deck";
import React, {useContext, useEffect, useRef, useState} from "react";
import {DeckTreeView} from "src/ui/views/deck";
import {sync} from "src/DeckBuilder";
import {AppContext} from "src/contexts/PluginContext";
import {Outlet, useLocation, useNavigate} from "react-router";
import {Link, NavLink} from "react-router-dom";

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

export enum ModalStates {
    HOME,
    DECK_REVIEW,
    CARD_CREATION
}

export function Root({handleCloseButton}: {handleCloseButton: () => void}) {
    // const router = createBrowserRouter([
    //     {
    //         path: "/index.html",
    //         element: <Root handleCloseButton={()=>this.close()}/>,
    //         errorElement: <ErrorPage />,
    //     },
    // ]);
    const [modalState, setModalState] = useState(ModalStates.HOME);
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
    const [tabState, setTabState] = useState(TabState.Notes);

    return (
        <>
            <NavLink to="/home/tags" >
                Tags
            </NavLink>
            <NavLink to="/home/notes" >
                Notes
            </NavLink>
            <Outlet/>
        </>
    // <div className={"Tabs"}>
    //         {/* Tab nav */}
    //         <ul className={"nav"}>
    //             <li className={`${tabState == TabState.Notes && "active-tab"}`}>
    //                 <Link to={`/index/tags`}>
    //                     Notes
    //                 </Link>
    //             </li>
    //             <li className={`${tabState == TabState.Tags && "active-tab"}`}>
    //                 <Link to={`/index/notes`}>
    //                     Tags
    //                 </Link>
    //             </li>
    //         </ul>
    //         <div className={"outlet"}>
    //             {/* content will be shown here */}
    //             <Outlet />
    //         </div>
    //     </div>
    );
};

// export function Notes({deck}:{deck: Deck}) {
export function Notes() {
    // TODO: rewrite to use props
    const deck = {dueFlashcardsCount: 10, newFlashcardsCount:20, totalFlashcards: 30} as Deck;
    return (
        <div className={"Notes"}>
           <ul>
               <li className={"tree-item-self is-clickable"}>
                   <div className={"tree-item-inner"}>Book 1</div>
                   <AllCardCounts deck={deck}/>
               </li>
               <li className={"tree-item-self is-clickable"}>
                   <div className={"tree-item-inner"}>
                       <Link to={'/notes/deck/1'}>
                           Book 2
                       </Link>
                   </div>
                   <AllCardCounts deck={deck}/>
               </li>
           </ul>
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
    console.log("in here");
    return (
        <p>Well, this is a let down!</p>
    );
}

export function Flashcard() {
    return (<p>lol</p>);
}