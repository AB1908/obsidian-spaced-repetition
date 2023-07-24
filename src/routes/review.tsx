import React, {useState} from "react";
import {useLoaderData} from "react-router";
import {Flashcard} from "src/data/models/flashcard";
import {ResponseButtons, ShowAnswerButton} from "src/ui/components/buttons";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {ReviewResponse, schedule} from "src/scheduling";
import {plugin, PluginData} from "src/main";
import {moment} from "obsidian";

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
        const l = {"id": "1923n8aq"}
        let flashcardById = getFlashcardById(l.id);
        if (flashcardById === null)
        return flashcardById;
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

export function ReviewDeck() {
    const currentCard = useLoaderData() as Flashcard;
    const [isQuestion, setIsQuestion] = useState(true);
    return (<>
        {isQuestion && (<>
            <Question questionText={currentCard.questionText}/>
            <ShowAnswerButton handleShowAnswerButton={() => setIsQuestion(false)}/>
            </>)}

        {!isQuestion && (<>
            <Question questionText={currentCard.questionText}/>
            <hr/>
            <Answer answerText={currentCard.answerText}/>
            <div className="sr-response">
                <Form method={"POST"}>
                    <Button text={currentCard.hardBtnText} id="sr-hard-btn"
                            responseHandler={() => console.log(ReviewResponse.Hard)} value={ReviewResponse.Hard}/>
                    <Button text={currentCard.goodBtnText} id="sr-good-btn"
                            responseHandler={() => console.log(ReviewResponse.Good)} value={ReviewResponse.Good}/>
                    <Button text={currentCard.easyBtnText} id="sr-easy-btn"
                            responseHandler={() => console.log(ReviewResponse.Easy)} value={ReviewResponse.Easy}/>
                </Form>
            </div>
        </>)}
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
        const result = await updateFlashcardSchedulingMetadata(params.flashcardId, reviewResponse);
        let nextCardId: string;
        if (result) {
            nextCardId = getNextCard(params.bookId);
        } else {
            // we're screwed
        }
        if (nextCardId) {
            return redirect(`../${nextCardId}`);
        } else {
            return redirect("..");
        }
    } else {
        return redirect(`./../sm18fbb3`)
    }
}

function getNextCard(id: string) {
    const l = {"id": "1923n8aq"}
    if (id === l.id)
        return {"id": "sm18fbb3"}.id;
    else
        return null;
}