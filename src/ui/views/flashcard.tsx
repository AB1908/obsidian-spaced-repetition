import { MULTI_SCHEDULING_EXTRACTOR, LEGACY_SCHEDULING_EXTRACTOR } from "src/constants";
import { Card, ReviewResponse, schedule } from "src/scheduling";
import { escapeRegexString } from "src/utils";
import { MarkdownRenderer } from "obsidian";
import React, { useEffect, useRef, useState, ReactNode, MutableRefObject } from "react";
import { Deck } from "src/Deck";
import { EditLaterButton, ResetButton, ResponseButtonsDiv, ShowAnswerButton } from "../components/buttons";
import { AdditionalProps, ModalStates } from "./modal";
import { PluginData } from "src/main";
import { FlashcardEditModal } from "./edit-modal";

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
            <EditLaterButton editLaterHandler={editLaterHandler}/>
            {!isQuestion && <ResetButton />}
            <FlashcardContextHeader text={contextText} />
        </>
    );
}

function FlashcardContent(props: FlashcardButtons) {
    const viewRef = useRef(null);

    return (
        <>
            <FlashcardHeader isQuestion={props.isQuestion} contextText={props.card.context} editLaterHandler={()=>edit(props.card)}/>
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

export function FlashcardView(props: FlashcardProps) {
    const [isQuestion, setIsQuestion] = useState(true);
    const [flashcardIndex, setFlashcardIndex] = useState(0);
    const deck: Deck = props.deck;
    const flashcardList = useRef(generateFlashcardList(deck));

    function handleShowAnswerButton() {
        setIsQuestion(false);
    }

    async function handleResponseButtons(clickedResponse: ReviewResponse) {
        // todo: move to useefect?
        await processReview(clickedResponse, flashcardList.current[flashcardIndex], props.additionalProps.pluginData, props.additionalProps.dueDatesFlashcards, props.additionalProps.easeByPath);
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

async function processReview(response: ReviewResponse, currentCard: Card, data: PluginData, dueDatesFlashcards: Record<number, number>, easeByPath: Record<string, number>): Promise<void> {
    if (this.ignoreStats) {
        if (response == ReviewResponse.Easy) {
        }
        return;
    }

    let interval: number, ease: number, due;

    if (response !== ReviewResponse.Reset) {
        let schedObj: Record<string, number>;
        // scheduled card
        if (currentCard.isDue) {
            schedObj = schedule(
                response,
                currentCard.interval,
                currentCard.ease,
                currentCard.delayBeforeReview,
                data.settings,
                dueDatesFlashcards
            );
        } else {
            let initial_ease: number = data.settings.baseEase;
            if (
                Object.prototype.hasOwnProperty.call(
                    easeByPath,
                    currentCard.note.path
                )
            ) {
                initial_ease = Math.round(easeByPath[currentCard.note.path]);
            }

            schedObj = schedule(
                response,
                1.0,
                initial_ease,
                0,
                data.settings,
                dueDatesFlashcards
            );
            interval = schedObj.interval;
            ease = schedObj.ease;
        }

        interval = schedObj.interval;
        ease = schedObj.ease;
        due = window.moment(Date.now() + interval * 24 * 3600 * 1000);
    } else {
        // due = this.resetFlashcard(due);
        return;
    }

    const dueString: string = due.format("YYYY-MM-DD");

    let fileText: string = await this.app.vault.read(currentCard.note);
    const replacementRegex = new RegExp(escapeRegexString(currentCard.cardText), "gm");

    let sep: string = data.settings.cardCommentOnSameLine ? " " : "\n";
    // Override separator if last block is a codeblock
    if (currentCard.cardText.endsWith("```") && sep !== "\n") {
        sep = "\n";
    }

    // check if we're adding scheduling information to the flashcard
    // for the first time
    if (currentCard.cardText.lastIndexOf("<!--SR:") === -1) {
        currentCard.cardText =
            currentCard.cardText + sep + `<!--SR:!${dueString},${interval},${ease}-->`;
    } else {
        let scheduling: RegExpMatchArray[] = [
            ...currentCard.cardText.matchAll(MULTI_SCHEDULING_EXTRACTOR),
        ];
        if (scheduling.length === 0) {
            scheduling = [...currentCard.cardText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];
        }

        const currCardSched: RegExpMatchArray = ["0", dueString, interval.toString(), ease.toString()];
        if (currentCard.isDue) {
            scheduling[currentCard.siblingIdx] = currCardSched;
        } else {
            scheduling.push(currCardSched);
        }

        currentCard.cardText = currentCard.cardText.replace(/<!--SR:.+-->/gm, "");
        currentCard.cardText += "<!--SR:";
        for (let i = 0; i < scheduling.length; i++) {
            currentCard.cardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
        }
        currentCard.cardText += "-->";
    }

    fileText = fileText.replace(replacementRegex, () => currentCard.cardText);
    for (const sibling of currentCard.siblings) {
        sibling.cardText = currentCard.cardText;
    }
    if (data.settings.burySiblingCards) {
        // this.burySiblingCards(true);
    }

    await this.app.vault.modify(currentCard.note, fileText);
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

    async function modifyCardText(originalText: string, replacementText: string) {
        if (!replacementText) return;
        if (replacementText == originalText) return;
        let fileText: string = await this.app.vault.read(this.currentCard.note);
        const originalTextRegex = new RegExp(escapeRegexString(originalText), "gm");
        fileText = fileText.replace(originalTextRegex, replacementText);
        await this.app.vault.modify(this.currentCard.note, fileText);
        this.currentDeck.deleteFlashcardAtIndex(this.currentCardIdx, this.currentCard.isDue);
        this.burySiblingCards(false);
        this.currentDeck.nextCard(this);
    }

    async function edit(currentCard: Card) {
        let textPromptArr = currentCard.cardText.split("\n");
        let textPrompt = "";
        if (textPromptArr[textPromptArr.length - 1].startsWith("<!--SR:")) {
            textPrompt = textPromptArr.slice(0, -1).join("\n");
        } else {
            textPrompt = currentCard.cardText;
        }

        let editModal = FlashcardEditModal.Prompt(this.app, this.plugin, textPrompt);
        editModal
            .then(async (modifiedCardText) => {
                modifyCardText(textPrompt, modifiedCardText);
            })
            .catch((reason) => console.log(reason));
    }