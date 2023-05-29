import React from "react";
import {Link} from "react-router-dom";
import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";
import {routes} from "src/ui/modals/flashcard-modal";

// export function ChapterList({chapterList}: { chapterList: any }) {
export function HighlightsList() {
    //TODO: add logic to emit book object when clicked
    const chapterData = {
        id: 1,
        title: "Chapter 1",
        notesWithoutTests: 20,
        notesWithTests: 11,
        highlights: [
            {
                id: 1,
                highlightContent: "This is a sample highlight",
                highlightNote: "This is a note for that highlight",
                flashcards: [
                    {
                        questionText: "This is a flashcard question that asks about highlight 1",
                        answerText: "This is the answer to that question"
                    },
                    {
                        questionText: "Flashcard 2",
                        answerText: "Answer 2"
                    },
                ]
            },
            {
                id: 2,
                highlightContent: "This is a sample highlight but without a note",
                //TODO: think about whether this should be a null or an empty string on the backend
                highlightNote: "",
                flashcards: []
            },
        ],
    }
    const deck1 = {dueFlashcardsCount: 10, newFlashcardsCount:20, totalFlashcards: 30, deckName: "Deck1"} as Deck;
    return (
        <>
            {/*
             This needs to be replaced with the chapter and the highlights done and remaining
             */}
            <h3>
                {chapterData.title}
            </h3>
            <h4>
                <AllCardCounts deck={deck1}/>
            </h4>
            <p>Add flashcards from:</p>
            <ul className={"sr-highlight-tree"}>
                {highlightsList.map((highlight: any) => (
                    <div>
                        <Link to={routes.flashcardsList}>
                            <li key={highlight.id} className={"sr-highlight tree-item-self is-clickable"}>
                                {highlight.highlightContent}
                                <span>
                                    <span className={"no-tests tree-item-flair sr-test-counts"}>
                                        {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                                        {highlight.flashcards.length}
                                    </span>
                                </span>
                            </li>
                        </Link>
                    </div>
                    ))}
            </ul>
        </>
    );
}
