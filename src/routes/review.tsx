import React, {useState} from "react";
import {useLoaderData} from "react-router";
import {Flashcard} from "src/data/models/flashcard";
import {ResponseButtons, ShowAnswerButton} from "src/ui/components/buttons";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {ReviewResponse, schedule} from "src/scheduling";
import {plugin, PluginData} from "src/main";
import {moment} from "obsidian";

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
    const currentCard = useLoaderData() as Flashcard;
    const [isQuestion, setIsQuestion] = useState(true);
    return (<>
        <FlashcardContext.Provider
            value={{
                handleShowAnswerButton: () => setIsQuestion(false),
                handleFlashcardResponse: (t: ReviewResponse) => handleResponseButtons(t),
                isQuestion: isQuestion,
                card: currentCard
            }}
        >
            <Question questionText={currentCard.questionText}/>
            <hr/>
            <Answer answerText={currentCard.answerText}/>
            <FlashcardFooter isQuestion={isQuestion} showAnswerHandler={() => setIsQuestion(false)}
                         card={currentCard}/>
        </FlashcardContext.Provider>
    </>);
}

function FlashcardFooter({isQuestion, showAnswerHandler, card}: {isQuestion: boolean, showAnswerHandler: () => void, card: Flashcard}) {
    if (isQuestion)
        return <ShowAnswerButton handleShowAnswerButton={() => showAnswerHandler()}/>;
    else
        return <ResponseButtons card={card} handleFlashcardResponse={(response: any) => console.log("Clicked!")}/>;
}

}