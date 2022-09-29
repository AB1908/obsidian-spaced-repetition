import { MarkdownRenderer, TFile } from "obsidian";
import React, { Component, ReactNode, useEffect, useRef, useState } from "react";
import { Deck } from "src/flashcard-modal";
import { Card, ReviewResponse } from "src/scheduling";
import { EditLaterButton, ResetButton, ResponseButtonsDiv, ShowAnswerButton } from "./buttons";
import { ModalStates } from "./modalContent";

interface FlashcardState {
    isQuestion: boolean;
    deck: Deck;
    flashcardIndex: number;
    subdeckArray: Deck[];
}

export interface FlashcardButtons extends ContentProps {
    responseButtonsHandler: Function;
    showAnswerButtonsHandler: Function;
}

interface ContentProps extends Props {
    isQuestion: boolean;
    card: Card;
}

interface Props {
    children?: React.ReactNode;
    viewRef?: React.MutableRefObject<HTMLDivElement>;
}

interface FlashcardProps {
    deck: Deck;
    processReview: Function;
    changeModalStatus: Function;
}

function Text(props: Props) {
    return <p>{props.children}</p>;
}

function FlashcardContextHeader() {
    return <div id="sr-context"></div>;
}

function FlashcardHeader({ isQuestion }: { isQuestion: boolean }) {
    return (
        <>
            <EditLaterButton />
            {!isQuestion && <ResetButton />}
            <FlashcardContextHeader />
        </>
    );
}

function ActualFlashcard(props: FlashcardButtons) {
    const viewRef = useRef(null);

    // async function renderMarkdownWrapper(
    //     markdownString: string,
    //     containerEl: HTMLElement,
    //     recursiveDepth = 0
    // ): Promise<void> {
    //     if (recursiveDepth > 4) return;

    //     MarkdownRenderer.renderMarkdown(
    //         markdownString,
    //         containerEl,
    //         props.card.note.path,
    //         this.plugin
    //     );

    //     // containerEl.findAll(".internal-embed").forEach((el) => {
    //     //     const link = this.parseLink(el.getAttribute("src"));

    //     //     // file does not exist, display dead link
    //     //     if (!link.target) {
    //     //         el.innerText = link.text;
    //     //     } else if (link.target instanceof TFile) {
    //     //         if (link.target.extension !== "md") {
    //     //             this.embedMediaFile(el, link.target);
    //     //         } else {
    //     //             el.innerText = "";
    //     //             this.renderTransclude(el, link, recursiveDepth);
    //     //         }
    //     //     }
    //     // });
    // }

    return (
        <>
            <FlashcardHeader isQuestion={props.isQuestion} />
            <FlashcardView
            // viewRef={viewRef}
            >
                <FlashcardBody viewRef={viewRef} card={props.card} isQuestion={props.isQuestion} />
            </FlashcardView>
            {props.isQuestion ? (
                <ShowAnswerButton handleClick={() => props.showAnswerButtonsHandler()} />
            ) : (
                <ResponseButtonsDiv
                    handleClick={(clickedResponse: ReviewResponse) =>
                        props.responseButtonsHandler(clickedResponse)
                    }
                />
            )}
        </>
    );
}

function FlashcardBody(props: ContentProps) {
    async function renderMarkdownWrapper(
        markdownString: string,
        containerEl: HTMLElement,
        recursiveDepth = 0
    ): Promise<void> {
        if (recursiveDepth > 4) return;

        await MarkdownRenderer.renderMarkdown(
            markdownString,
            containerEl,
            props.card.note.path,
            null
        );

        // containerEl.findAll(".internal-embed").forEach((el) => {
        //     const link = this.parseLink(el.getAttribute("src"));

        //     // file does not exist, display dead link
        //     if (!link.target) {
        //         el.innerText = link.text;
        //     } else if (link.target instanceof TFile) {
        //         if (link.target.extension !== "md") {
        //             this.embedMediaFile(el, link.target);
        //         } else {
        //             el.innerText = "";
        //             this.renderTransclude(el, link, recursiveDepth);
        //         }
        //     }
        // });
    }

    useEffect(() => {
        if (!props.isQuestion) renderMarkdownWrapper(props.card.back, props.viewRef.current);

        // return () => {

        // }
    }, [props.isQuestion]);

    return (
        <>
            {/* Question */}
            <Text>{props.card?.front}</Text>
            {!props.isQuestion && (
                <div id="markdown-child" ref={props.viewRef}>
                    <hr id="sr-hr-card-divide" />
                    {/* Answer */}
                    {/* <Text>{props.card?.back}</Text> */}
                    {}
                </div>
            )}
        </>
    );
}

// function ClozeQuestionText() {
//     return (
//         <p>
//             new <span style={{ color: "#2196f3" }}>[...]</span>
//         </p>
//     );
// }

// function ClozeAnswerText() {
//     return (
//         <p>
//             new <span style={{ color: "#2196f3" }}>things</span>
//         </p>
//     );
// }

export function Flashcard(props: FlashcardProps) {
    const [isQuestion, setIsQuestion] = useState(true);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    // const [deck, setDeck] = useState(props.deck);
    const deck = props.deck;
    const flashcardList = useRef(generateFlashcardList(deck));
    // const []
    console.log("Inside flashacrd", props);

    function handleShowAnswerButton() {
        setIsQuestion(false);
    }

    function generateFlashcardList(deck: Deck) {
        console.log("generateFlashcardList: top", deck);
        let currentDeck = deck;
        let stack: Deck[] = [];
        let flashcards: Card[] = [];
        while (stack || currentDeck) {
            flashcards.push(...currentDeck.newFlashcards);
            flashcards.push(...currentDeck.dueFlashcards);
            if (currentDeck.subdecks.length) {
                stack.push(...currentDeck.subdecks);
            }
            currentDeck = stack.pop();
            if (!currentDeck) {
                break;
            }
        }
        return flashcards;
    }

    async function handleResponseButtons(clickedResponse: ReviewResponse) {
        await props.processReview(clickedResponse, flashcardList.current[flashcardIndex]);
        if (flashcardIndex + 1 < flashcardList.current.length) {
            setFlashcardIndex(flashcardIndex + 1);
            setIsQuestion(true);
        } else {
            console.log("out of cards");
            // setDeck(null);
            props.changeModalStatus(ModalStates.deckNotInReview);
        }
    }

    return (
        <>
            <ActualFlashcard
                card={flashcardList.current[flashcardIndex]}
                isQuestion={isQuestion}
                responseButtonsHandler={(clickedResponse: ReviewResponse) =>
                    handleResponseButtons(clickedResponse)
                }
                showAnswerButtonsHandler={() => handleShowAnswerButton()}
            />
        </>
    );
}

function FlashcardView(props: Props) {
    return (
        <div id="sr-flashcard-view" ref={props.viewRef}>
            {props.children}
        </div>
    );
}

//     this.renderMarkdownWrapper(this.currentCard.back, this.flashcardView);

async function renderMarkdownWrapper(
    markdownString: string,
    containerEl: HTMLElement,
    recursiveDepth = 0
): Promise<void> {
    if (recursiveDepth > 4) return;

    MarkdownRenderer.renderMarkdown(
        markdownString,
        containerEl,
        this.currentCard.note.path,
        this.plugin
    );

    // containerEl.findAll(".internal-embed").forEach((el) => {
    //     const link = this.parseLink(el.getAttribute("src"));

    //     // file does not exist, display dead link
    //     if (!link.target) {
    //         el.innerText = link.text;
    //     } else if (link.target instanceof TFile) {
    //         if (link.target.extension !== "md") {
    //             this.embedMediaFile(el, link.target);
    //         } else {
    //             el.innerText = "";
    //             this.renderTransclude(el, link, recursiveDepth);
    //         }
    //     }
    // });
}
