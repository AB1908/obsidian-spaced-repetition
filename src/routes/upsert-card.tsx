import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {redirect, useParams} from "react-router-dom";
import React from "react";
import {CardTypePicker, ClozeCardForm, DefaultCardForm} from "src/ui/components/card-creation";
import {deck} from "src/api";

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
    return deck.chapters[1].highlights[0];
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