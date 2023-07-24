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

function FlashcardFooter({isQuestion, showAnswerHandler, card}: {isQuestion: boolean, showAnswerHandler: () => void, card: Flashcard}) {
    if (isQuestion)
        return <ShowAnswerButton handleShowAnswerButton={() => showAnswerHandler()}/>;
    else
        return <ResponseButtons card={card} handleFlashcardResponse={(response: any) => console.log("Clicked!")}/>;
}

}