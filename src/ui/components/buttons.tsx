import {Platform} from "obsidian";
import React, {useContext} from "react";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {AppContext} from "src/contexts/PluginContext";
import {ReviewResponse, schedule, textInterval} from "src/scheduling";
import {Link} from "react-router-dom";
import {plugin, PluginData} from "src/main";
import {Card} from "src/Card";
import {Flashcard} from "src/data/models/flashcard";

export function EditLaterButton({ editLaterHandler }: { editLaterHandler: Function }) {
    return <div className="sr-link" onClick={() => editLaterHandler()}>Edit Later</div>;
}

export function ResetButton() {
    return (
        <div className="sr-link">
            Reset card's progress
        </div>
    );
}

export function ShowAnswerButton(props: {handleShowAnswerButton: Function}) {
    // const { handleShowAnswerButton } = useContext(FlashcardContext);
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

export function calculateIntervals(data: PluginData, card: Card|Flashcard) {
    let interval = 1.0,
        ease: number = data.settings.baseEase,
        delayBeforeReview = 0;

    if (card.isDue) {
        interval = card.interval;
        ease = card.ease;
        if (card instanceof Card) {
            delayBeforeReview = card.delayBeforeReview;
        }
    }

    function getInterval(response?: ReviewResponse) {
        return schedule(
            response,
            interval,
            ease,
            delayBeforeReview,
            data.settings
        ).interval;
    }

    const hardInterval: number = getInterval(ReviewResponse.Hard);
    const goodInterval: number = getInterval(ReviewResponse.Good);
    const easyInterval: number = getInterval(ReviewResponse.Easy);
    return {hardInterval, goodInterval, easyInterval};
}

export function generateButtonText(hardInterval: number, goodInterval: number, easyInterval: number, data: PluginData) {
    let hardBtnText, goodBtnText, easyBtnText;
    if (Platform.isMobile) {
        hardBtnText = `${textInterval(hardInterval, true)}`;
        goodBtnText = `${textInterval(goodInterval, true)}`;
        easyBtnText = `${textInterval(easyInterval, true)}`;
    } else {
        // TODO: investigate fix for button labels being empty
        hardBtnText = `${data.settings.flashcardHardText} - ${textInterval(hardInterval, false)}`
        goodBtnText = `${data.settings.flashcardGoodText} - ${textInterval(goodInterval, false)}`;
        easyBtnText = `${data.settings.flashcardEasyText} - ${textInterval(easyInterval, false)}`;
    }
    return {hardBtnText, goodBtnText, easyBtnText};
}

export function ResponseButtons({card, handleFlashcardResponse}: {card: Flashcard|Card, handleFlashcardResponse: Function}) {
    const data = plugin.data;
    let easyBtnText: string, goodBtnText: string, hardBtnText: string;
    // const { handleFlashcardResponse } = useContext(FlashcardContext);
    const {hardInterval, goodInterval, easyInterval} = calculateIntervals(data, card);
    ({hardBtnText, goodBtnText, easyBtnText} = generateButtonText(hardInterval, goodInterval, easyInterval, data));

    return (
        <div className="sr-response">
            <Button text={hardBtnText} id="sr-hard-btn" responseHandler={() => handleFlashcardResponse(ReviewResponse.Hard)} />
            <Button text={goodBtnText} id="sr-good-btn" responseHandler={() => handleFlashcardResponse(ReviewResponse.Good)} />
            <Button text={easyBtnText} id="sr-easy-btn" responseHandler={() => handleFlashcardResponse(ReviewResponse.Easy)} />
        </div>
    );
}

export function CancelButton() {
    return <Link to={"./.."}>
        <button>
            Cancel
        </button>
    </Link>;
}

export function SubmitButton() {
    return <button type="submit" className={"mod-cta"}>Submit</button>;
}