import { MarkdownRenderer } from "obsidian";
import { ReactNode, MutableRefObject, useRef, useEffect } from "react";
import { Deck } from "src/Deck";
import { Card, ReviewResponse } from "src/scheduling";
import { AdditionalProps } from "../views/modal";
import { EditLaterButton, ResetButton, ShowAnswerButton, ResponseButtonsDiv } from "./buttons";

export interface FlashcardButtons extends ContentProps {
    handleFlashcardResponse: Function;
    showAnswerButtonsHandler: Function;
    flashcardEditLater: Function;
}

interface ContentProps extends Props {
    isQuestion: boolean;
    card: Card;
}

interface Props {
    children?: ReactNode;
    viewRef?: MutableRefObject<HTMLDivElement>;
}

export interface FlashcardProps {
    deck: Deck;
    changeModalStatus: Function;
    additionalProps: AdditionalProps;
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
            <p>{props.card?.front}</p>
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
