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

export function cardLoader({params}: {params: any}) {
    // we arrived here from an existing flashcard
    // todo: potentially split into different component and loader? this seems error prone
    if (params.flashcardId === undefined) {
        return null;
    }
    return fetch(`http://localhost:3000/flashcards/${params.flashcardId}`);
}

// TODO: think of a better name since this also edits cards
// The path is basically being used as a bit of state but not explicitly so.
// Is there a better way of doing this?
export function UpsertCard() {
    const flashcard: any = useLoaderData() as Flashcard;
    let defaultQuestionValue = flashcard?.questionText || "";
    let defaultAnswerValue = flashcard?.answerText || "";
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