import { MarkdownRenderer } from "obsidian";
import React, { useEffect, useRef, useState, ReactNode, MutableRefObject } from "react";
import { Deck } from "src/Deck";
import { Card, ReviewResponse } from "src/scheduling";
import { EditLaterButton, ResetButton, ResponseButtonsDiv, ShowAnswerButton } from "./buttons";
import { ModalStates } from "./modal";

export interface FlashcardButtons extends ContentProps {
    handleFlashcardResponse: Function;
    showAnswerButtonsHandler: Function;
}

interface ContentProps extends Props {
    isQuestion: boolean;
    card: Card;
}

interface Props {
    children?: ReactNode;
    viewRef?: MutableRefObject<HTMLDivElement>;
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
    // TODO: add actual content
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

function FlashcardContent(props: FlashcardButtons) {
    const viewRef = useRef(null);

    return (
        <>
            <FlashcardHeader isQuestion={props.isQuestion} />
            <div id="sr-flashcard-view" ref={props.viewRef}>
                <FlashcardBody viewRef={viewRef} card={props.card} isQuestion={props.isQuestion} />
            </div>
            {props.isQuestion ? (
                <ShowAnswerButton handleFlashcardResponse={() => props.showAnswerButtonsHandler()} />
            ) : (
                <ResponseButtonsDiv
                    handleFlashcardResponse={(clickedResponse: ReviewResponse) =>
                        props.handleFlashcardResponse(clickedResponse)
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
                    { }
                </div>
            )}
        </>
    );
}

export function Flashcard(props: FlashcardProps) {
    const [isQuestion, setIsQuestion] = useState(true);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const deck: Deck = props.deck;
    const flashcardList = useRef(generateFlashcardList(deck));

    function handleShowAnswerButton() {
        setIsQuestion(false);
    }

    function generateFlashcardList(deck: Deck) {
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
        // todo: move to useefect?
        await props.processReview(clickedResponse, flashcardList.current[flashcardIndex]);
        if (flashcardIndex + 1 < flashcardList.current.length) {
            setFlashcardIndex(flashcardIndex + 1);
            setIsQuestion(true);
        } else {
            props.changeModalStatus(ModalStates.DECK_NOT_IN_REVIEW);
        }
    }

    return (
        <>
            <FlashcardContent
                card={flashcardList.current[flashcardIndex]}
                isQuestion={isQuestion}
                handleFlashcardResponse={(clickedResponse: ReviewResponse) =>
                    handleResponseButtons(clickedResponse)
                }
                showAnswerButtonsHandler={() => handleShowAnswerButton()}
            />
        </>
    );
}