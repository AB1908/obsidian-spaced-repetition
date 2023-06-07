import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {redirect, useParams} from "react-router-dom";
import React from "react";
import {CardTypePicker, ClozeCardForm, DefaultCardForm} from "src/ui/components/card-creation";

enum CardType {
    REGULAR,
    REVERSED,
    CLOZE
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
    // TODO: add loader logic
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
            <ClozeCardForm/>
        </>
    );
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