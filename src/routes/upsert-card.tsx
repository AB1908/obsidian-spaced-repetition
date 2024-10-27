import React from "react";
import { DefaultCardForm } from "src/ui/components/card-creation";
import { getFlashcardById } from "src/api";
import { USE_ACTUAL_BACKEND } from "src/routes/review";

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
    return (
        <>
            <DefaultCardForm />
        </>
    );
}