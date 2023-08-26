import React, {useEffect, useState} from "react";
import {redirect, useLoaderData, useLocation} from "react-router-dom";
import {getCurrentCard, getFlashcardById, getNextCard, updateFlashcardSchedulingMetadata} from "src/api";
import {CardBack, CardFront} from "src/ui/components/flashcard";

export const USE_ACTUAL_BACKEND = true;

export interface FrontendFlashcard {
    delayBeforeReview: number;
    ease: number;
    isDue: boolean;
    id: string,
    questionText: string,
    answerText: string,
    context: string,
    cardType: number,
    annotationId: string,
    interval: number,
}

// The idea here is that if I start a review, I don't immediately have a flashcard ID
// So I need to fetch the first flashcard in the queue
// And then redirect myself to that flashcard
// So that I can subsequently call getFlashcardById() using the flashcardId from the params
export async function reviewLoader({params}) {
    if (USE_ACTUAL_BACKEND) {
        let flashcardId = null;
        if (params.flashcardId == null) {
            // todo: handle no cards to be reviewed case
            flashcardId = getCurrentCard(params.bookId)?.id;
            if (flashcardId == null) {
                return redirect("./..");
            }
            return redirect(`${flashcardId}`);
        } else {
            flashcardId = params.flashcardId;
        }
        return getFlashcardById(flashcardId, params.bookId);
    } else {
        if (params.flashcardId == null) {
            const response = await fetch(`http://localhost:3000/review/${params.bookId}`)
            const flashcardId = (await response.json()).first;
            return redirect(`${flashcardId}`)
        }
        return (await (await fetch(`http://localhost:3000/review/${params.bookId}`)).json()).flashcards.filter((t: FrontendFlashcard) => t.id === params.flashcardId)[0];
    }
}

export function ReviewDeck() {
    const currentCard = useLoaderData() as FrontendFlashcard;
    const [isQuestion, setIsQuestion] = useState(true);
    const location = useLocation();

    // reset state when we navigate to a new flashcard
    // todo: think of cleaner way to do this as it is slow
    useEffect(() => {
        setIsQuestion(() => true)
    }, [location])

    return (<>
        {isQuestion && (<CardFront currentCard={currentCard} handleShowAnswerButton={() => setIsQuestion(false)}/>)}

        {!isQuestion && (<CardBack currentCard={currentCard} />)}
    </>);
}

export async function reviewAction({request, params}) {
    const data = await request.formData();
    const reviewResponse = data.get("reviewResponse");
    if (USE_ACTUAL_BACKEND) {
        // should I wait for a successful write? can get troublesome as files get bigger
        // but let's think about scale later
        // I need to get the id of the next card
        // if no next card, redirect to deck
        // need to cast this for some weird reason
        // todo: investigate casting later
        const result = await updateFlashcardSchedulingMetadata(params.flashcardId, params.bookId, Number(reviewResponse));
        let nextCardId: string | undefined;
        nextCardId = getNextCard(params.bookId)?.id;
        if (nextCardId) {
            return redirect(`./../${nextCardId}`);
        } else {
            return redirect("./../..");
        }
    } else {
        if (params.flashcardId === "1923n8aq")
            return redirect(`./../sm18fbb3`)
        else return redirect("./../..");
    }
}