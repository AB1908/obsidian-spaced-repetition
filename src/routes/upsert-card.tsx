import {useLoaderData} from "react-router";
import {redirect} from "react-router-dom";
import React from "react";
import {DefaultCardForm} from "src/ui/components/card-creation";
import {createFlashcardForAnnotation, getFlashcardById, updateFlashcardById} from "src/controller";
import {CardType} from "src/scheduler/scheduling";
import {Flashcard} from "src/data/models/flashcard";
import {USE_ACTUAL_BACKEND} from "src/routes/review";

export function cardLoader({params}: {params: any}) {
    // we arrived here from an existing flashcard
    // todo: potentially split into different component and loader? this seems error prone
    if (params.flashcardId === undefined) {
        return null;
    }
    if (USE_ACTUAL_BACKEND) {
        return getFlashcardById(params.flashcardId, params.bookId);
    } else {
        return fetch(`http://localhost:3000/flashcards/${params.flashcardId}`);
    }
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
    await createFlashcardForAnnotation(data.get("question"), data.get("answer"), params.annotationId, params.bookId);
    return redirect(`/books/${params.bookId}/chapters/${params.chapterId}/annotations/${params.annotationId}/flashcards`);
}

export async function updateAction({params, request}: {params: any, request: any}): Promise<Response> {
    // TODO: Add logic to update the deck
    const data = await request.formData();
    // TODO: call the right api instead, there shouldn' be any actual update logic
    // I have access to bookId, sectionId, annotationId
    await updateFlashcardById(params.flashcardId, data.get("question"), data.get("answer"), params.bookId);
    return redirect(`/books/${params.bookId}/chapters/${params.chapterId}/annotations/${params.annotationId}/flashcards`);
}
