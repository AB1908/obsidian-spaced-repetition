import { MarkdownRenderer } from "obsidian";
import React, { MutableRefObject, useRef, useEffect } from "react";
import { Deck } from "src/Deck";
import { Card, CardType } from "src/scheduling";
import { EditLaterButton, ResetButton, ShowAnswerButton, ResponseButtonsDiv } from "./buttons";

export interface FlashcardButtons extends ContentProps {
    flashcardEditLater: Function;
}

interface ContentProps {
    isQuestion: boolean;
    card: Card;
    viewRef?: MutableRefObject<HTMLDivElement>;
}

export interface FlashcardProps {
    deck: Deck;
    changeModalStatus: Function;
}

function FlashcardContextHeader({ text }: { text: string }) {
    // TODO: add actual content
    return <div id="sr-context">{text}</div>;
}

function FlashcardHeader({ isQuestion, contextText, editLaterHandler }: { isQuestion: boolean, contextText: string, editLaterHandler: Function }) {
    return (
        <>
            <EditLaterButton editLaterHandler={editLaterHandler} />
            {!isQuestion && <ResetButton />}
            <FlashcardContextHeader text={contextText} />
        </>
    );
}

export function FlashcardContent(props: FlashcardButtons) {
    const viewRef = useRef(null);

    return (
        <>
            <FlashcardHeader isQuestion={props.isQuestion} contextText={props.card.context} editLaterHandler={() => props.flashcardEditLater()} />
            <div id="sr-flashcard-view" ref={props.viewRef}>
                <FlashcardBody viewRef={viewRef} card={props.card} isQuestion={props.isQuestion} />
            </div>
            {props.isQuestion ? (<ShowAnswerButton />) : (<ResponseButtonsDiv />)}
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
            <QuestionText cardType={props.card.cardType} questionText={props.card.front} />
            {!props.isQuestion && (
                <div id="markdown-child" ref={props.viewRef}>
                    <hr id="sr-hr-card-divide" />
                    {/* Answer */}
                </div>
            )}
        </>
    );
}

function QuestionText({ cardType, questionText }: { cardType: CardType, questionText: string }) {
    if (cardType != CardType.Cloze)
        return <p>{questionText}</p>
    else
        return <p dangerouslySetInnerHTML={{ __html: questionText }}></p>
}