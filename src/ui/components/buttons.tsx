import React from "react";
import { ReviewResponse } from "src/scheduling";

export interface ButtonProps {
    handleFlashcardResponse: Function;
}

export function EditLaterButton({ editLaterHandler }: { editLaterHandler: Function }) {
    return <div className="sr-link" onClick={() => editLaterHandler()}>Edit Later</div>;
}

export function ResetButton() {
    return (
        <div className="sr-link" style={{ float: "right" }}>
            Reset card's progress
        </div>
    );
}

export function ShowAnswerButton(props: ButtonProps) {
    return (
        <button
            id="sr-show-answer"
            style={{ display: "initial" }}
            onClick={() => props.handleFlashcardResponse()}
        >
            Show Answer
        </button>
    );
}

function Button({ text, id, responseHandler }) {
    return (<button id={id} onClick={() => responseHandler()}>
        {text}
    </button>)
}

export function ResponseButtonsDiv(props: ButtonProps) {
    return (
        <div className="sr-response" style={{ display: "grid" }}>
            <Button text={`Hard - 1 day(s)`} id="sr-hard-btn" responseHandler={()=>props.handleFlashcardResponse(ReviewResponse.Hard)} />
            <Button text={`Good - 1 day(s)`} id="sr-good-btn" responseHandler={()=>props.handleFlashcardResponse(ReviewResponse.Good)} />
            <Button text={`Easy - 1 day(s)`} id="sr-easy-btn" responseHandler={()=>props.handleFlashcardResponse(ReviewResponse.Easy)} />
        </div>
    );
}