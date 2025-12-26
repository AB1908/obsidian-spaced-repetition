import {calculateIntervals} from "src/scheduler/scheduling";
import { ReviewResponse } from "src/scheduler/CardType";
import {Button, generateButtonText, ShowAnswerButton} from "src/ui/components/buttons";
import React from "react";
import {FrontendFlashcard} from "src/routes/review";

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

export function CardFront(props: { currentCard: FrontendFlashcard, handleShowAnswerButton: () => void }) {
    return <>
        <div className={"sr-card-body"}>
            <Question questionText={props.currentCard.questionText}/>
        </div>
        <ShowAnswerButton handleShowAnswerButton={props.handleShowAnswerButton}/>
    </>;
}

export function CardBack(props: {
    currentCard: FrontendFlashcard,
    clickHandler: (reviewResponse: number) => void,
}) {
    const {hardInterval, goodInterval, easyInterval} = calculateIntervals(props.currentCard);
    const {hardBtnText, goodBtnText, easyBtnText} = generateButtonText(hardInterval, goodInterval, easyInterval);
    return <>
        <div className={"sr-card-body"}>
            <Question questionText={props.currentCard.questionText}/>
            <hr/>
            <Answer answerText={props.currentCard.answerText}/>
        </div>
        <div className="sr-response">
            <Button text={hardBtnText} id="sr-hard-btn" clickHandler={() => props.clickHandler(ReviewResponse.Hard)}/>
            <Button text={goodBtnText} id="sr-good-btn" clickHandler={() => props.clickHandler(ReviewResponse.Good)}/>
            <Button text={easyBtnText} id="sr-easy-btn" clickHandler={() => props.clickHandler(ReviewResponse.Easy)}/>
        </div>
    </>;
}