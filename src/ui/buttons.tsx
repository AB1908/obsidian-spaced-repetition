import React, { Component, ReactNode } from "react";
import { Deck } from "src/flashcard-modal";
import { ReviewResponse } from "src/scheduling";
import { QuestionProps } from "./flashcard";

export class AllButtons extends Component {
    hardFlashcard(e: Event) {
        // this.hardBtn.addEventListener("click", () => {
        //     this.processReview(ReviewResponse.Hard);
        // });
        // this.processReview(ReviewResponse.Hard);
    }

    render(): ReactNode {
        return (
            <>
                <button id="sr-hard-btn">Hard - {"1 day(s)"}</button>
                <button id="sr-good-btn">Good - {"2.5 day(s)"}</button>
                <button id="sr-easy-btn" onClick={() => console.log("Sooo hard")}>
                    Easy - {"3.5 day(s)"}
                </button>
            </>
        );
    }
}

export class EditLaterButton extends Component {
    render(): ReactNode {
        return <div className="sr-link">Edit Later</div>;
    }
}

export class ResetButton extends Component {
    render(): ReactNode {
        return (
            <div className="sr-link" style={{ float: "right" }}>
                Reset card's progress
            </div>
        );
    }
}

export class ShowAnswerButton extends Component<QuestionProps> {
    clicker() {}

    render(): ReactNode {
        return (
            <button
                id="sr-show-answer"
                style={{ display: "initial" }}
                onClick={() => this.props.handleClick()}
            >
                Show Answer
            </button>
        );
    }
}

// // const elem = React.createElement(EasyButton);
// this.hardBtn = document.createElement("button");
// this.hardBtn.setAttribute("id", "sr-hard-btn");
// this.hardBtn.setText(this.plugin.data.settings.flashcardHardText);
// this.hardBtn.addEventListener("click", () => {
//     this.processReview(ReviewResponse.Hard);
// });
// this.responseDiv.appendChild(this.hardBtn);

// this.goodBtn = document.createElement("button");
// this.goodBtn.setAttribute("id", "sr-good-btn");
// this.goodBtn.setText(this.plugin.data.settings.flashcardGoodText);
// this.goodBtn.addEventListener("click", () => {
//     this.processReview(ReviewResponse.Good);
// });
// this.responseDiv.appendChild(this.goodBtn);

// // this.easyBtn = document.createElement("button");
// // this.easyBtn.setAttribute("id", "sr-easy-btn");
// // this.easyBtn.setText(this.plugin.data.settings.flashcardEasyText);
// // this.easyBtn.addEventListener("click", () => {
// //     this.processReview(ReviewResponse.Easy);
// // });
// // this.responseDiv.appendChild(this.easyBtn);
// // this.responseDiv.style.display = "none";
