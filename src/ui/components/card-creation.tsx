// TODO: move each page to its own file
// TODO: move data to loader functions
// KILL: Figure out how to cache data between pages. may need subroutes
// TODO: handle action for card submission. How to update plugin data?
import React from "react";
import {Form, Link, redirect, useLocation} from "react-router-dom";
import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {routes} from "src/ui/modals/flashcard-modal";

export async function highlightLoader() {
    const test = {
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
    };
    return test;
}

export function ChooseCardType() {
    //TODO: fix any
    const highlight: any = useLoaderData();
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>

            <p>
                Which type of flashcard?
            </p>

            <ol>

                <Link to={routes.createRegularCard}>
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

export function PreviewExistingFlashcards() {
    const highlight = useLoaderData();
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <div>
                <p>
                    Existing questions:
                </p>
                <ul>
                    {highlight.flashcards.map((t,i) => (
                        <Link to={""}>
                            <li key={i}>
                                <p>
                                    {t.questionText}
                                </p>
                                <p>
                                    {t.answerText}
                                </p>
                            </li>
                        </Link>
                    ))}
                    <Link to={routes.createCard}>
                        <li>
                            Add new card
                        </li>

                    </Link>
                </ul>
            </div>
        </>
    )
}

export function CreateRegularCard() {
    const highlight = useLoaderData();
    const {pathname} = useLocation();
    console.log(pathname);
    const pathFragments = pathname.split("/");
    const currentPath = pathFragments[pathFragments.length-1];
    let defaultQuestionValue = currentPath != "regular" ? highlight.flashcards[0].questionText : "";
    let defaultAnswerValue = currentPath != "regular" ? highlight.flashcards[0].answerText : "";
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <Form method="post">
                <div className={"sr-question-input"}>
                    <div className={"label-wrapper"}>
                        <label htmlFor={"question"} className={"sr-question-input-label"}>
                            Question
                        </label>
                    </div>
                    <textarea id={"question"} name={"question"} className={"sr-question-input-text"} defaultValue={defaultQuestionValue} required/>
                </div>
                <div className={"sr-answer-input"}>
                   <div className={"label-wrapper"}>
                       <label htmlFor={"answer"} className={"sr-answer-input-label"}>
                           Answer
                       </label>
                   </div>
                   <textarea id={"answer"} name={"answer"} className={"sr-answer-input-text"} defaultValue={defaultAnswerValue} required />
                </div>

                <button type="submit" className={"mod-cta"} >Submit</button>

                {/*TODO: Replace with useNavigate and use history?*/}
                <Link to={"./.."} className={""}>
                    <button>
                        Cancel
                    </button>
                </Link>
            </Form>
        </>
    );
}

export async function creationAction(): Promise<Response> {
    // TODO: Add logic to update the deck
    // TODO: call the right api instead, there shouldn' be any actual update logic
    console.log("Submitted!");
    return redirect(routes.flashcardsList);
}