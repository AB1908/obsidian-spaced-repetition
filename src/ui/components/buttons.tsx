import { Platform } from "obsidian";
import React, { useContext } from "react";
import { FlashcardContext } from "src/contexts/FlashcardContext";
import { AppContext } from "src/contexts/PluginContext";
import { ReviewResponse, schedule, textInterval } from "src/scheduling";

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

export function ShowAnswerButton() {
    const { handleShowAnswerButton } = useContext(FlashcardContext);
    return (
        <button
            id="sr-show-answer"
            style={{ display: "initial" }}
            onClick={() => handleShowAnswerButton()}
        >
            Show Answer
        </button>
    );
}

//TODO: Add types
function Button({ text, id, responseHandler }: { text: string, id: string, responseHandler: Function }) {
    return (<button id={id} onClick={() => responseHandler()}>
        {text}
    </button>)
}

export function ResponseButtons() {
    const { data } = useContext(AppContext)
    let easyBtnText: string, goodBtnText: string, hardBtnText: string;
    const { handleFlashcardResponse } = useContext(FlashcardContext);

    let interval = 1.0,
        ease: number = data.settings.baseEase,
        delayBeforeReview = 0;
    const hardInterval: number = schedule(
        ReviewResponse.Hard,
        interval,
        ease,
        delayBeforeReview,
        data.settings
    ).interval;
    const goodInterval: number = schedule(
        ReviewResponse.Good,
        interval,
        ease,
        delayBeforeReview,
        data.settings
    ).interval;
    const easyInterval: number = schedule(
        ReviewResponse.Easy,
        interval,
        ease,
        delayBeforeReview,
        data.settings
    ).interval;

    // if (ignoreStats) {
    //     // Same for mobile/desktop
    //     hardBtn.setText(`${plugin.data.settings.flashcardHardText}`);
    //     easyBtn.setText(`${plugin.data.settings.flashcardEasyText}`);
    // } else if (Platform.isMobile) {
    if (Platform.isMobile) {
        hardBtnText = `${textInterval(hardInterval, true)}`;
        goodBtnText = `${textInterval(goodInterval, true)}`;
        easyBtnText = `${textInterval(easyInterval, true)}`;
    } else {
        // hardBtn.setText(
        hardBtnText = `${data.settings.flashcardHardText} - ${textInterval(
            hardInterval,
            false
        )}`
        // );
        // goodBtn.setText(
        goodBtnText = `${data.settings.flashcardGoodText} - ${textInterval(
            goodInterval,
            false
        )}`;
        // );
        // easyBtn.setText(
        easyBtnText = `${data.settings.flashcardEasyText} - ${textInterval(
            easyInterval,
            false
        )}`;
        // );
        // }

        //TODO: Use correct scheduling information
        return (
            <div className="sr-response" style={{ display: "flex", justifyContent: "space-evenly" }}>
                <Button text={hardBtnText} id="sr-hard-btn" responseHandler={() => handleFlashcardResponse(ReviewResponse.Hard)} />
                <Button text={goodBtnText} id="sr-good-btn" responseHandler={() => handleFlashcardResponse(ReviewResponse.Good)} />
                <Button text={easyBtnText} id="sr-easy-btn" responseHandler={() => handleFlashcardResponse(ReviewResponse.Easy)} />
            </div>
        );
    }
}
