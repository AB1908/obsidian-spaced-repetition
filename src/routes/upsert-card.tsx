import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {redirect, useParams} from "react-router-dom";
import React from "react";
import {ClozeCardForm, DefaultCardForm} from "src/ui/components/card-creation";

export function clozeLoader() {
    // TODO: Add redirect if we have cloze card
    return {
        highlight: "Onen i-Estel Edain, ú-chebin estel anim.",
        note: "What a beautiful line by Tolkien",
    };
}

export function ClozeCard() {
    // TODO: add loader logic
    const highlight = useLoaderData();
    const {flashcardId} = useParams();
    const flashcardIndex = Number(flashcardId);
    const defaultClozeValue = highlight.flashcards[flashcardIndex]?.questionText || "";
    return (
        <>
            <NoteAndHighlight highlightText={highlight.highlightContent} noteText={highlight.highlightNote}/>
            <ClozeCardForm defaultClozeValue={defaultClozeValue}/>
        </>
    );
}

// TODO: think of a better name since this also edits cards
// The path is basically being used as a bit of state but not explicitly so.
// Is there a better way of doing this?
export function UpsertCard() {
    const annotation: any = useLoaderData();
    const {flashcardId} = useParams();
    const flashcardIndex = Number(flashcardId);
    let flashcard = annotation.flashcards[flashcardIndex];
    const defaultQuestionValue = flashcard?.questionText || "";
    const defaultAnswerValue = flashcard?.answerText || "";
    return (
        <>
            <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note}/>

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