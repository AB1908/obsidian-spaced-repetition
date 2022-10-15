import { MarkdownRenderer } from "obsidian";
import React, { MutableRefObject, useRef, useEffect, useContext } from "react";
import { FlashcardContext } from "src/contexts/FlashcardContext";
import { Deck } from "src/Deck";
import { CardType } from "src/scheduling";
import { EditLaterButton, ResetButton, ShowAnswerButton, ResponseButtons } from "./buttons";

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
        <>
            <EditLaterButton editLaterHandler={editLaterHandler} />
            {!isQuestion && <ResetButton />}
            <FlashcardContextHeader text={contextText} />
        </>
    );
}

function FlashcardFooter() {
    const { isQuestion } = useContext(FlashcardContext);

    if (isQuestion)
        return <ShowAnswerButton />;
    else
        return <ResponseButtons />;
}

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
        if (!isQuestion) renderMarkdownWrapper(card.back, props.viewRef.current);
    }, [isQuestion]);

    return (
        <>
            {/* Question */}
            <QuestionText cardType={card.cardType} questionText={card.front} />
            {!isQuestion && (
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