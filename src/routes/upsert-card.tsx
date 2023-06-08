import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {redirect, useParams} from "react-router-dom";
import React from "react";
import {CardTypePicker, ClozeCardForm, DefaultCardForm} from "src/ui/components/card-creation";

export function ChooseCardType() {
    const highlight = useLoaderData();

    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <CardTypePicker />
        </>
    );
}

export function clozeLoader() {
    return {
        id: 1,
        color: "",
        highlightContent: "Onen i-Estel Edain, ú-chebin estel anim.",
        highlightNote: "What a beautiful line by Tolkien",
        flashcards: [
            {
                "isDue": true,
                "note": null,
                "questionText": " i-Estel Edain, ú-chebin estel anim.",
                "answerText": "Onen",
                "cardText": "==Onen== i-Estel Edain, ==ú-chebin== estel ==anim==.\n<!--SR:!2022-11-14,2,230!2022-11-14,2,210!2022-11-14,2,190-->",
                "context": "",
                "cardType": 4,
                "siblings": [],
                "clozeInsertionAt": 0,
                "interval": 2,
                "ease": 230,
                "delayBeforeReview": 17662032301
            },
            {
                questionText: "Flashcard 2 from chapter 1",
                answerText: "Answer 2"
            },
        ]
    };
}

export function ClozeCard(props: any) {
    // TODO: add loader logic
    const data = useLoaderData();
    return (
        <>
            <NoteAndHighlight highlightText={data.highlightContent} noteText={data.highlightNote}/>
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