import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {Form, Link, redirect, useLocation, useParams} from "react-router-dom";
import React, {useState} from "react";
import {routes} from "src/ui/modals/flashcard-modal";

enum CardType {
    REGULAR,
    REVERSED,
    CLOZE
}

function CardTypePicker() {
    return (<>
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
    </>);
}

export function ChooseCardType() {
    const highlight = useLoaderData();
    debugger;
    return (<>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <CardTypePicker />
    </>
    )
}

function CardForm(props: { defaultQuestionValue: string, defaultAnswerValue: string}) {
    return <Form method="post">
        <div className={"sr-question-input"}>
            <div className={"label-wrapper"}>
                <label htmlFor={"question"} className={"sr-question-input-label"}>
                    Question
                </label>
            </div>
            <textarea id={"question"} name={"question"} className={"sr-question-input-text"}
                      defaultValue={props.defaultQuestionValue} required/>
        </div>
        <div className={"sr-answer-input"}>
            <div className={"label-wrapper"}>
                <label htmlFor={"answer"} className={"sr-answer-input-label"}>
                    Answer
                </label>
            </div>
            <textarea id={"answer"} name={"answer"} className={"sr-answer-input-text"}
                      defaultValue={props.defaultAnswerValue} required/>
        </div>

        <button type="submit" className={"mod-cta"}>Submit</button>

        {/*TODO: Replace with useNavigate and use history?*/}
        <Link to={"./.."}>
            <button>
                Cancel
            </button>
        </Link>
    </Form>;
}

// TODO: think of a better name since this also edits cards
// The path is basically being used as a bit of state but not explicitly so.
// Is there a better way of doing this?
export function UpsertCard() {
    const highlight: any = useLoaderData();
    // const [cardType, setCardType] = useState(null);
    // const {pathname} = useLocation();
    const {flashcardId} = useParams();
    const flashcardIndex = Number(flashcardId);
    // const pathFragments = pathname.split("/");
    // const currentPath = pathFragments[pathFragments.length - 1];
    debugger;
    let defaultQuestionValue = highlight.flashcards[flashcardIndex]?.questionText || "";
    let defaultAnswerValue = highlight.flashcards[flashcardIndex]?.answerText || "";
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>

            <CardForm defaultQuestionValue={defaultQuestionValue} defaultAnswerValue={defaultAnswerValue}/>
        </>
    );
}

export async function creationAction(): Promise<Response> {
    // TODO: Add logic to update the deck
    // TODO: call the right api instead, there shouldn' be any actual update logic
    console.log("Submitted!");
    return redirect(routes.flashcardsList);
}