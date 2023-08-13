import React from "react";
import {ReviewResponse} from "src/scheduler/scheduling";
import {Link} from "react-router-dom";

export function ShowAnswerButton(props: {handleShowAnswerButton: Function}) {
    return (
        <button
            id="sr-show-answer"
            onClick={() => props.handleShowAnswerButton()}
        >
            Show Answer
        </button>
    );
}

//TODO: Add types
export function Button({ text, id, responseHandler, value }: { text: string, id: string, responseHandler: Function, value: ReviewResponse }) {
    return (<button name={"reviewResponse"} id={id} onClick={() => responseHandler()} value={value}>
        {text}
    </button>)
}

export function CancelButton() {
    return (
        <button>
            <Link to={"./.."}>
            Cancel
            </Link>
        </button>
    );
}

export function SubmitButton() {
    return <button type="submit" className={"mod-cta"}>Submit</button>;
}