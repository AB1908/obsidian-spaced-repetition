import {useLoaderData} from "react-router";
import {redirect} from "react-router-dom";
import React from "react";
import {DefaultCardForm} from "src/ui/components/card-creation";
import {createFlashcardForAnnotation, getFlashcardById, updateFlashcardContentsById} from "src/api";
import {Flashcard} from "src/data/models/flashcard";
import {USE_ACTUAL_BACKEND} from "src/routes/review";

export interface CardLoaderParams {
    bookId: string;
    flashcardId: string;
}

export function cardLoader({params}: {params: CardLoaderParams}) {
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
    const flashcard = useLoaderData() as Flashcard;
    const defaultQuestionValue = flashcard?.questionText || "";
    const defaultAnswerValue = flashcard?.answerText || "";
    return (
        <>
            <DefaultCardForm defaultQuestionValue={defaultQuestionValue} defaultAnswerValue={defaultAnswerValue}/>
        </>
    );
}

// todo: fix any
export async function creationAction({params, request}: {params: any, request: any}): Promise<Response> {
    // TODO: Add logic to update the deck
    const data = await request.formData();
    // TODO: call the right api instead, there shouldn' be any actual update logic
    // I have access to bookId, sectionId, annotationId
    await createFlashcardForAnnotation(data.get("question"), data.get("answer"), params.annotationId, params.bookId);
    return redirect(`/books/${params.bookId}/chapters/${params.chapterId}/annotations/${params.annotationId}/flashcards`);
}

// todo: fix any
export async function updateAction({params, request}: {params: any, request: any}): Promise<Response> {
    // TODO: Add logic to update the deck
    const data = await request.formData();
    // TODO: call the right api instead, there shouldn' be any actual update logic
    // I have access to bookId, sectionId, annotationId
    await updateFlashcardContentsById(params.flashcardId, data.get("question"), data.get("answer"), params.bookId);
    // return redirect(`/books/${params.bookId}/chapters/${params.chapterId}/annotations/${params.annotationId}/flashcards`);
    return redirect("./..");
}
