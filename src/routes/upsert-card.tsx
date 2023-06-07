import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {Form, Link, redirect, useLocation, useParams} from "react-router-dom";
import React from "react";
import {CancelButton, SubmitButton} from "src/ui/components/buttons";

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
            <Link to={"regular"}>
                <li>
                    Regular
                </li>
            </Link>
            <Link to={"reversed"}>
                <li>
                    Reversed
                </li>
            </Link>
            <Link to={"cloze"}>
                <li>
                    Cloze
                </li>
            </Link>
        </ol>
    </>);
}

export function ChooseCardType() {
    const highlight = useLoaderData();

    return (<>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <CardTypePicker />
    </>
    )
}

export function ClozeCard(props: any) {
    const loader = {
        "isDue": true,
        "note": null,
        "lineNo": 2,
        "front": " i-Estel Edain, ú-chebin estel anim.\n<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
        "back": "Onen",
        "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.\n<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
        "context": "",
        "cardType": 4,
        "siblings": [],
        "siblingIdx": 0,
        "clozeInsertionAt": 0,
        "interval": 2,
        "ease": 230,
        "delayBeforeReview": 17662032301
    };
    return (
        <>
            <NoteAndHighlight highlightText={"Onen i estel edain"} noteText={"wat a beautiful note"}/>
            <Form method="post">
                <div className={"sr-cloze-input"}>
                    <div className={"label-wrapper"}>
                        <label htmlFor={"cloze"} className={"sr-cloze-input-label"}>
                            Cloze
                        </label>
                    </div>
                    <textarea id={"cloze"} name={"cloze"} className={"sr-cloze-input-text"}
                              defaultValue={loader.cardText} required/>
                </div>

                <SubmitButton/>

                {/*TODO: Replace with useNavigate and use history?*/}
                <CancelButton/>
            </Form>
        </>
    );
}

function DefaultCardForm(props: { defaultQuestionValue: string, defaultAnswerValue: string}) {
    // todo: add some sort of header signifying the type of card being added
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

        <SubmitButton/>

        {/*TODO: Replace with useNavigate and use history?*/}
        <CancelButton/>
    </Form>;
}

// TODO: think of a better name since this also edits cards
// The path is basically being used as a bit of state but not explicitly so.
// Is there a better way of doing this?
export function UpsertCard() {
    const highlight: any = useLoaderData();
    const {flashcardId} = useParams();
    const flashcardIndex = Number(flashcardId);
    let defaultQuestionValue = highlight.flashcards[flashcardIndex]?.questionText || "";
    let defaultAnswerValue = highlight.flashcards[flashcardIndex]?.answerText || "";
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>

            <DefaultCardForm defaultQuestionValue={defaultQuestionValue} defaultAnswerValue={defaultAnswerValue}/>
        </>
    );
}

export async function creationAction(): Promise<Response> {
    // TODO: Add logic to update the deck
    // TODO: call the right api instead, there shouldn' be any actual update logic
    console.log("Submitted!");
    return redirect("./../..");
}