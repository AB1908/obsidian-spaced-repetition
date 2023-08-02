import {MarkdownRenderer} from "obsidian";
import React, {MutableRefObject, useContext, useEffect, useRef} from "react";
import {FlashcardContext} from "src/contexts/FlashcardContext";
import {Deck} from "src/Deck";
import {CardType} from "src/scheduler/scheduling";
import {EditLaterButton, ResetButton, ResponseButtons, ShowAnswerButton} from "./buttons";
import {Card} from "src/Card";
import {removeSchedTextFromCard} from "src/sched-utils";
import {renderToString} from 'react-dom/server';

export interface FlashcardButtons extends ContentProps {
    flashcardEditLater: Function;
}

interface ContentProps {
    viewRef?: MutableRefObject<HTMLDivElement>;
}

export interface FlashcardProps {
    deck: Deck;
    changeModalStatus: Function;
}

function FlashcardContextHeader({ text }: { text: string }) {
    return <div id="sr-context">{text}</div>;
}

function FlashcardHeader({ editLaterHandler }: { editLaterHandler: Function }) {
    const { isQuestion } = useContext(FlashcardContext);
    const contextText = useContext(FlashcardContext).card.context;

    return (
        <div className={"sr-header"}>
            <EditLaterButton editLaterHandler={editLaterHandler} />
            {!isQuestion && <ResetButton />}
            <FlashcardContextHeader text={contextText} />
        </div>
    );
}

function FlashcardFooter() {
    const { isQuestion , card, handleFlashcardResponse, handleShowAnswerButton} = useContext(FlashcardContext);

    if (isQuestion)
        return <ShowAnswerButton handleShowAnswerButton={handleShowAnswerButton}/>;
    else
        return <ResponseButtons card={card} handleFlashcardResponse={handleFlashcardResponse}/>;
}

// TODO: this sucks. change the components to show a full question and answer separately.
export function FlashcardContent(props: FlashcardButtons) {
    const viewRef = useRef(null);

    return (
        <>
            <FlashcardHeader editLaterHandler={() => props.flashcardEditLater()} />
            <div id="sr-flashcard-view" ref={props.viewRef}>
                <FlashcardBody viewRef={viewRef} />
            </div>
            <FlashcardFooter />
        </>
    );
}

function FlashcardBody(props: ContentProps) {
    const { isQuestion } = useContext(FlashcardContext);
    const { card } = useContext(FlashcardContext);


    async function renderMarkdownWrapper(
        markdownString: string,
        containerEl: HTMLElement,
        recursiveDepth = 0
    ): Promise<void> {
        if (recursiveDepth > 4) return;

        await MarkdownRenderer.renderMarkdown(
            markdownString,
            containerEl,
            card.note.path,
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
        if (!isQuestion) renderMarkdownWrapper(renderToString(<AnswerText card={card} cardType={card.cardType} />), props.viewRef.current);
    }, [isQuestion]);

    return (
        <>
            {/* Question */}
            <QuestionText cardType={card.cardType} card={card} />
            {!isQuestion && (
                <div id="markdown-child" ref={props.viewRef}>
                    <hr id="sr-hr-card-divide" />
                    {/* Answer */}
                </div>
            )}
        </>
    );
}

function QuestionText({ cardType, card }: { cardType: CardType; card: Card }) {
    if (cardType != CardType.Cloze)
        return <p>{card.front}</p>
    else {
        let splitCardText = split_at_index(removeSchedTextFromCard(card.front), card.clozeInsertionAt);
        splitCardText.splice(1, 0, <QuestionSpan></QuestionSpan>)
        return <p>{splitCardText}</p>
    }
}

function AnswerText({ cardType, card }: { cardType: CardType; card: Card }) {
    if (cardType != CardType.Cloze)
        return <p>{card.front}</p>
    else {
        let splitCardText = split_at_index(removeSchedTextFromCard(card.front), card.clozeInsertionAt);
        splitCardText.splice(1, 0, <AnswerSpan text={card.back}></AnswerSpan>)
        return <p>{splitCardText}</p>
    }
}

function QuestionSpan() {
    return <span style={{ color: "#2196f3" }}>[...]</span>
}

function AnswerSpan({ text }: { text: string }) {
    return <span style={{ color: "#2196f3" }}>{text}</span>
}

// TODO: Fix return type
function split_at_index(value: string, index: number): any[] {
    return [value.substring(0, index), value.substring(index)];
}