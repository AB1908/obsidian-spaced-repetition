import {useLoaderData} from "react-router";
import {NoteAndHighlight} from "src/ui/components/note-and-highlight";
import {redirect, useParams} from "react-router-dom";
import React from "react";
import {ClozeCardForm, DefaultCardForm} from "src/ui/components/card-creation";
import {createFlashcardForHighlight} from "src/controller";
import {CardType} from "src/scheduling";

export function clozeLoader() {
    // TODO: Add redirect if we have cloze card
    return {
        highlight: "Onen i-Estel Edain, ú-chebin estel anim.",
        note: "What a beautiful line by Tolkien",
    };
}

export function ClozeCard() {
    // DONE: add loader logic
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

export function cardLoader() {

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
            <DefaultCardForm defaultQuestionValue={defaultQuestionValue} defaultAnswerValue={defaultAnswerValue}/>
        </>
    );
}

export async function creationAction({params, request}: {params: any, request: any}): Promise<Response> {
    // TODO: Add logic to update the deck
    const data = await request.formData();
    // TODO: call the right api instead, there shouldn' be any actual update logic
    // I have access to bookId, sectionId, annotationId
    await createFlashcardForHighlight(data.get("question"), data.get("answer"), params.annotationId, CardType.MultiLineBasic)
    return redirect(`/books/${params.bookId}/chapters/${params.chapterId}/annotations/${params.annotationId}/flashcards`);
}