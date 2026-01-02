import React, { useEffect } from "react";
import { useLoaderData } from "react-router";
import { DefaultCardForm } from "src/ui/components/card-creation";
import { getFlashcardById } from "src/api";
import { Flashcard } from "src/data/models/flashcard";
import { USE_ACTUAL_BACKEND } from "src/ui/routes/books/review";
import { useModalTitle } from "src/ui/modals/ModalTitleContext";
import { truncate } from "src/utils/text-helpers";

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
    const { setModalTitle } = useModalTitle();
    const defaultQuestionValue = flashcard?.questionText || "";
    const defaultAnswerValue = flashcard?.answerText || "";

    useEffect(() => {
        if (flashcard) {
            setModalTitle(`Editing: ${truncate(flashcard.questionText, 50)}`);
        } else {
            setModalTitle("Creating New Flashcard");
        }
    }, [flashcard, setModalTitle]);

    return (
        <>
            <DefaultCardForm defaultQuestionValue={defaultQuestionValue} defaultAnswerValue={defaultAnswerValue}/>
        </>
    );
}
