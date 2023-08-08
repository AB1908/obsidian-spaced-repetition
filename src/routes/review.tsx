import React, {useEffect, useState} from "react";
import {useLoaderData, useLocation, Form, redirect } from "react-router-dom";
import {ReviewResponse} from "src/scheduler/scheduling";
import {Button, ShowAnswerButton} from "src/ui/components/buttons";
import {getFlashcardById, getNextCard, updateFlashcardSchedulingMetadata} from "src/controller";

export const USE_ACTUAL_BACKEND = true;

interface Flashcard {
    id: string,
    questionText: string,
    answerText: string,
    context: string,
    cardType: number,
    annotationId: string,
    parsedCardId: string,
    goodBtnText: string,
    easyBtnText: string,
    hardBtnText: string,
}

// The idea here is that if I start a review, I don't immediately have a flashcard ID
// So I need to fetch the first flashcard in the queue
// And then redirect myself to that flashcard
// So that I can subsequently call getFlashcardById() using the flashcardId from the params
export async function reviewLoader({params}: { params: any }) {
    if (USE_ACTUAL_BACKEND) {
        // const l = {"id": "1923n8aq"}
        // let flashcardById = getFlashcardById(l.id);
        // if (flashcardById === null)
        // return flashcardById;
        // if (params.flashcardId == null) {
        //     return redirect(`${params.flashcardId}`)
        // }
        let flashcardId = null;
        if (params.flashcardId == null) {
            flashcardId = getNextCard(params.bookId).id;
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
        return (await (await fetch(`http://localhost:3000/review/${params.bookId}`)).json()).flashcards.filter(t => t.id === params.flashcardId)[0];
    }
}

function Question(props: { questionText: string }) {
    return <p>
        {props.questionText}
    </p>;
}

function Answer(props: { answerText: string }) {
    return <p>
        {props.answerText}
    </p>;
}

function CardFront(props: { currentCard: Flashcard, handleShowAnswerButton: () => void }) {
    return <>
        <Question questionText={props.currentCard.questionText}/>
        <ShowAnswerButton handleShowAnswerButton={props.handleShowAnswerButton}/>
    </>;
}

function CardBack(props: {
    currentCard: Flashcard,
    hardBtnHandler: () => void,
    goodBtnHandler: () => void,
    easyBtnHandler: () => void
}) {
    return <>
        <Question questionText={props.currentCard.questionText}/>
        <hr/>
        <Answer answerText={props.currentCard.answerText}/>
        <div className="sr-response">
            <Form method={"POST"}>
                <Button text={props.currentCard.hardBtnText} id="sr-hard-btn"
                        responseHandler={props.hardBtnHandler} value={ReviewResponse.Hard}/>
                <Button text={props.currentCard.goodBtnText} id="sr-good-btn"
                        responseHandler={props.goodBtnHandler} value={ReviewResponse.Good}/>
                <Button text={props.currentCard.easyBtnText} id="sr-easy-btn"
                        responseHandler={props.easyBtnHandler} value={ReviewResponse.Easy}/>
            </Form>
        </div>
    </>;
}

export function ReviewDeck() {
    const currentCard = useLoaderData() as Flashcard;
    const [isQuestion, setIsQuestion] = useState(true);
    const location = useLocation();

    // reset state when we navigate to a new flashcard
    useEffect(() => {
        setIsQuestion(() => true)
    }, [location])

    function buttonHandler(reviewResponse: ReviewResponse) {
        console.log(reviewResponse);
    }

    return (<>
        {isQuestion && (<CardFront currentCard={currentCard} handleShowAnswerButton={() => setIsQuestion(false)}/>)}

        {!isQuestion && (<CardBack currentCard={currentCard} hardBtnHandler={() => buttonHandler(ReviewResponse.Hard)}
                                   goodBtnHandler={() => buttonHandler(ReviewResponse.Good)}
                                   easyBtnHandler={() => buttonHandler(ReviewResponse.Easy)}/>)}
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
        const result = await updateFlashcardSchedulingMetadata(params.flashcardId, params.bookId, reviewResponse);
        let nextCardId: string;
        if (result) {
            nextCardId = getNextCard(params.bookId)?.id;
        } else {
            // we're screwed
        }
        if (nextCardId) {
            return redirect(`./../${nextCardId}`);
        } else {
            return redirect("..");
        }
    } else {
        console.log('trying')
        if (params.flashcardId === "1923n8aq")
            return redirect(`./../sm18fbb3`)
        else return redirect("./../..");
    }
}