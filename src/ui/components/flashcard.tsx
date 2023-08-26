import {calculateIntervals, ReviewResponse} from "src/scheduler/scheduling";
import {Button, generateButtonText, ShowAnswerButton} from "src/ui/components/buttons";
import {Form} from "react-router-dom";
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
}) {
    const {hardInterval, goodInterval, easyInterval} = calculateIntervals(props.currentCard);
    let {hardBtnText, goodBtnText, easyBtnText} = generateButtonText(hardInterval, goodInterval, easyInterval);
    return <>
        <div className={"sr-card-body"}>
            <Question questionText={props.currentCard.questionText}/>
            <hr/>
            <Answer answerText={props.currentCard.answerText}/>
        </div>
        <div className="sr-response">
            <Form method={"POST"} className={"sr-response-form"}>
                <Button text={hardBtnText} id="sr-hard-btn" value={ReviewResponse.Hard}/>
                <Button text={goodBtnText} id="sr-good-btn" value={ReviewResponse.Good}/>
                <Button text={easyBtnText} id="sr-easy-btn" value={ReviewResponse.Easy}/>
            </Form>
        </div>
    </>;
}