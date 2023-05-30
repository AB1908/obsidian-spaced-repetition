import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {Form, Link, useLocation} from "react-router-dom";
import {routes} from "src/ui/modals/flashcard-modal";
import React from "react";

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

export function CreateRegularCard() {
    const highlight = useLoaderData();
    const {pathname} = useLocation();
    console.log(pathname);
    const pathFragments = pathname.split("/");
    const currentPath = pathFragments[pathFragments.length - 1];
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
                    <textarea id={"question"} name={"question"} className={"sr-question-input-text"}
                              defaultValue={defaultQuestionValue} required/>
                </div>
                <div className={"sr-answer-input"}>
                    <div className={"label-wrapper"}>
                        <label htmlFor={"answer"} className={"sr-answer-input-label"}>
                            Answer
                        </label>
                    </div>
                    <textarea id={"answer"} name={"answer"} className={"sr-answer-input-text"}
                              defaultValue={defaultAnswerValue} required/>
                </div>

                <button type="submit" className={"mod-cta"}>Submit</button>

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