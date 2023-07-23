import React, {useState} from "react";
import {useLoaderData} from "react-router";
import {Flashcard} from "src/data/models/flashcard";
import {ResponseButtons, ShowAnswerButton} from "src/ui/components/buttons";

export function reviewLoader({params}: {params: any}) {
    return fetch(`http://localhost:3000/review/${params.bookId}`)
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
    const flashcards: Flashcard[] = (useLoaderData() as any).flashcards;
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const [isQuestion, setIsQuestion] = useState(true);
    const currentCard = flashcards[flashcardIndex];
    return (<>
        <Question questionText={currentCard.questionText}/>
        <hr/>
        <Answer answerText={currentCard.answerText}/>
        <FlashcardFooter isQuestion={isQuestion} showAnswerHandler={() => setIsQuestion(false)}
                         card={currentCard}/>
    </>);
}

function FlashcardFooter({isQuestion, showAnswerHandler, card}: {isQuestion: boolean, showAnswerHandler: () => void, card: Flashcard}) {
    if (isQuestion)
        return <ShowAnswerButton handleShowAnswerButton={() => showAnswerHandler()}/>;
    else
        return <ResponseButtons card={card} handleFlashcardResponse={(response: any) => console.log("Clicked!")}/>;
}