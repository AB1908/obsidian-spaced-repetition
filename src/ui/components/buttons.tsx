import React from "react";
import { ReviewResponse } from "src/scheduling";

export interface ButtonProps {
    handleFlashcardResponse: Function;
}


function AllButtons(props: ButtonProps) {
    return (
        <>
            <button id="sr-hard-btn" onClick={() => props.handleFlashcardResponse(ReviewResponse.Hard)}>
                Hard - {"1 day(s)"}
            </button>
            <button id="sr-good-btn" onClick={() => props.handleFlashcardResponse(ReviewResponse.Good)}>
                Good - {"2.5 day(s)"}
            </button>
            <button id="sr-easy-btn" onClick={() => props.handleFlashcardResponse(ReviewResponse.Easy)}>
                Easy - {"3.5 day(s)"}
            </button>
        </>
    );
}

export function EditLaterButton({editLaterHandler}: {editLaterHandler: Function}) {
    return <div className="sr-link" onClick={()=>editLaterHandler()}>Edit Later</div>;
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

export function ResponseButtonsDiv(props: ButtonProps) {
    return (
        <div className="sr-response" style={{ display: "grid" }}>
            <AllButtons handleFlashcardResponse={props.handleFlashcardResponse} />
        </div>
    );
}
