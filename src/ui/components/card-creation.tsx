import React from "react";
import {Link} from "react-router-dom";
import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";

function NoteAndHighlight() {
    return <>
        <div>
            <blockquote className={"markdown-rendered blockquote"}>

                <p>
                    This is a sample highlight
                </p>
            </blockquote>

        </div>
        <div>
            <blockquote>
                <p>
                    This is a sample note
                </p>
            </blockquote>
        </div>
    </>;
}

export function ChooseCardType() {
    const highlightsList = [
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
    ];
const highlight = highlightsList[0];
    return (
        <>
            <NoteAndHighlight/>
            <p>
                Which type of flashcard?
            </p>
            <ol>

                <Link to={"/notes/deck/chapters/1/add/regular"}>
                    <li>
                        Regular
                    </li>
                </Link>
                <Link to={""}>
                    <li>
                        Reversed
                    </li>

                </Link>
                <Link to={""}>
                    <li>
                        Cloze
                    </li>
                </Link>

            </ol>
        </>
    );
}

export function CreateRegularCard() {
    return (
        <>
            <NoteAndHighlight/>
            <div className={"sr-question-input"}>
                <div className={"label-wrapper"}>

                    <label htmlFor={"question"} className={"sr-question-input-label"}>
                        Question
                    </label>
                </div>
                <textarea id={"question"} name={"question"} className={"sr-question-input-text"} />
            </div>
            <div className={"sr-answer-input"}>
               <div className={"label-wrapper"}>
                   <label htmlFor={"answer"} className={"sr-answer-input-label"}>
                       Answer
                   </label>
               </div>
                <textarea id={"answer"} name={"answer"} className={"sr-answer-input-text"}/>
            </div>
            <Link to={""}>
                <button className={"mod-cta"}>
                    Submit
                </button>
            </Link>
            <Link to={""} className={""}>
                <button>
                    Cancel
                </button>
            </Link>
        </>
    );
}