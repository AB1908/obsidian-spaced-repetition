import React, { FormEventHandler, useEffect, useRef, useState } from "react";
import { Form, redirect, useLoaderData, useNavigate, useParams } from "react-router-dom";
import {
    deleteFlashcard, getAnnotationById,
    getCurrentCard,
    getFlashcardById,
    getNextCard, updateFlashcardContentsById,
    updateFlashcardSchedulingMetadata
} from "src/api";
import { CardBack, CardFront} from "src/ui/components/flashcard";
import { setIcon } from "obsidian";
import { Icon } from "src/routes/root";
import { NoteAndHighlight } from "src/ui/components/note-and-highlight";
import { TextInputWithLabel } from "src/ui/components/card-creation";
import { CancelButton } from "src/ui/components/buttons";
import { CardLoaderParams } from "src/routes/upsert-card";

export const USE_ACTUAL_BACKEND = true;

export interface FrontendFlashcard {
    delayBeforeReview: number;
    ease: number;
    id: string,
    questionText: string,
    answerText: string,
    context: string,
    cardType: number,
    parentId: string,
    interval: number,
}

interface ReviewLoaderParams {
    bookId: string;
    flashcardId?: string;
}

// The idea here is that if I start a review, I don't immediately have a flashcard ID
// So I need to fetch the first flashcard in the queue
// And then redirect myself to that flashcard
// So that I can subsequently call getFlashcardById() using the flashcardId from the params
export async function reviewLoader({params}: {params: ReviewLoaderParams}) {
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
            const response = await fetch(`http://localhost:3000/review/${params.bookId}`);
            const flashcardId = (await response.json()).first;
            return redirect(`${flashcardId}`);
        }
        return (await (await fetch(`http://localhost:3000/review/${params.bookId}`)).json()).flashcards.filter((t: FrontendFlashcard) => t.id === params.flashcardId)[0];
    }
}

export function ReviewDeck() {
    const currentCard = useLoaderData() as FrontendFlashcard;
    const [isQuestion, setIsQuestion] = useState(true);
    const params = useParams<keyof ReviewLoaderParams>();
    const navigate = useNavigate();
    const editButton = useRef<HTMLDivElement>(null);
    const deleteButton = useRef<HTMLDivElement>(null);
    const skipButton = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const editIcon: Icon = "lucide-pencil";
        const deleteIcon: Icon = "trash";
        const skipIcon: Icon = "skip-forward";
        //todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(editButton.current, editIcon);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(deleteButton.current, deleteIcon);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(skipButton.current, skipIcon);
    }, []);


    // todo: think about moving these
    function navigateToNextCard() {
        const nextCardId = getNextCard(params.bookId)?.id || null;
        if (nextCardId) {
            navigate(`./../${nextCardId}`, {replace: true});
        } else {
            navigate(-1);
        }
        setIsQuestion(() => true);
    }

// would have to deal with redirects again I guess
    async function flashcardResponseHandler(reviewResponse: number) {
        if (params.flashcardId == null) throw new Error("ReviewDeck: flashcardId cannot be null or undefined");
        if (params.bookId == null) throw new Error("ReviewDeck: bookId cannot be null or undefined");
        await updateFlashcardSchedulingMetadata(params.flashcardId, params.bookId, reviewResponse);
        navigateToNextCard();
    }

    function editButtonClickHandler() {
        navigate("edit");
    }

    async function deleteButtonHandler() {
        navigateToNextCard();
        await deleteFlashcard(params.bookId, params.flashcardId);
    }

    function skipButtonHandler() {
        navigateToNextCard();
    }

    // todo: might need this?
    // function previousButtonHandler() {
    //
    // }

    return (<>
        <div className={"buttons"}>
            <button onClick={() => editButtonClickHandler()}>
                <div ref={editButton}/>
            </button>
            <button onClick={() => deleteButtonHandler()}>
                <div ref={deleteButton}/>
            </button>
            <button onClick={() => skipButtonHandler()}>
                <div ref={skipButton}/>
            </button>
        </div>
        {isQuestion && (<CardFront currentCard={currentCard} handleShowAnswerButton={() => setIsQuestion(false)}/>)}

        {!isQuestion && (<CardBack currentCard={currentCard} clickHandler={flashcardResponseHandler}/>)}
    </>);
}

// typing idea stolen from https://stackoverflow.com/a/68253165
interface EditCardFormElements extends HTMLFormElement {
    question: HTMLInputElement;
    answer: HTMLInputElement;
}

export function EditCard() {
    const currentCard = useLoaderData() as FrontendFlashcard;
    // todo: think about removing unknown cast
    // remember edit is literally not reachable without the two params
    // so should never throw error
    const {bookId, flashcardId} = useParams() as unknown as CardLoaderParams;
    const annotation = getAnnotationById(currentCard.parentId, bookId);
    const navigate = useNavigate();
    const submitButtonHandler: FormEventHandler<EditCardFormElements> = async (e) => {
        // Arrow function idea copied from https://stackoverflow.com/a/76491499
        e.preventDefault();
        await updateFlashcardContentsById(flashcardId, e.currentTarget.question.value, e.currentTarget.answer.value, bookId);
        navigate(-1);
    };

    return (
        <>
            <div className={"sr-annotation"}>
                <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note} />
            </div>
            <Form method="post" className={"sr-card-form"} replace onSubmit={submitButtonHandler}>
                <TextInputWithLabel className={"sr-question-input"} htmlFor={"question"}
                                    defaultValue={currentCard.questionText}/>
                <TextInputWithLabel className={"sr-answer-input"} htmlFor={"answer"}
                                    defaultValue={currentCard.answerText}/>
                <div className={"modal-button-container"}>
                    <button type="submit" className={"mod-cta"}>Submit</button>
                    <CancelButton/>
                </div>
            </Form>
        </>
    );
}

export async function editCardAction() {
    return null;
}