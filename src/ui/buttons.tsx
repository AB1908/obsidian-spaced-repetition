import React, { Component, ReactNode, useEffect } from "react";
import { MULTI_SCHEDULING_EXTRACTOR, LEGACY_SCHEDULING_EXTRACTOR } from "src/constants";
import { Deck, FlashcardModal } from "src/flashcard-modal";
import { Card, ReviewResponse, schedule } from "src/scheduling";
import { escapeRegexString } from "src/utils";

export interface ButtonProps {
    handleClick: Function;
}

function AllButtons(props: ButtonProps) {
    return (
        <>
            <button id="sr-hard-btn" onClick={() => props.handleClick(ReviewResponse.Hard)}>
                Hard - {"1 day(s)"}
            </button>
            <button id="sr-good-btn" onClick={() => props.handleClick(ReviewResponse.Good)}>
                Good - {"2.5 day(s)"}
            </button>
            <button id="sr-easy-btn" onClick={() => props.handleClick(ReviewResponse.Easy)}>
                Easy - {"3.5 day(s)"}
            </button>
        </>
    );
}

export function EditLaterButton() {
    return <div className="sr-link">Edit Later</div>;
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
            onClick={() => props.handleClick()}
        >
            Show Answer
        </button>
    );
}

export function ResponseButtonsDiv(props: ButtonProps) {
    return (
        <div className="sr-response" style={{ display: "grid" }}>
            <AllButtons handleClick={props.handleClick} />
        </div>
    );
}
