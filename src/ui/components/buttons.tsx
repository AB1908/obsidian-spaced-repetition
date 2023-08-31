import React from "react";
import {textInterval} from "src/scheduler/scheduling";
import {Link} from "react-router-dom";
import {Platform} from "obsidian";
import {plugin} from "src/main";

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
export function Button({ text, id, clickHandler }: { text: string, id: string, clickHandler: Function }) {
    return (<button name={"reviewResponse"} id={id} onClick={() => clickHandler()}>
        {text}
    </button>);
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

export function generateButtonText(hardInterval: number, goodInterval: number, easyInterval: number) {
    let hardBtnText, goodBtnText, easyBtnText;
    if (Platform.isMobile) {
        hardBtnText = `${textInterval(hardInterval, true)}`;
        goodBtnText = `${textInterval(goodInterval, true)}`;
        easyBtnText = `${textInterval(easyInterval, true)}`;
    } else {
        // TODO: investigate fix for button labels being empty
        const {data} = plugin;
        hardBtnText = `${data.settings.flashcardHardText} - ${textInterval(hardInterval, false)}`;
        goodBtnText = `${data.settings.flashcardGoodText} - ${textInterval(goodInterval, false)}`;
        easyBtnText = `${data.settings.flashcardEasyText} - ${textInterval(easyInterval, false)}`;
    }
    return {hardBtnText, goodBtnText, easyBtnText};
}