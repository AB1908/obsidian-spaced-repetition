import {t} from "src/lang/helpers";
import {Deck, deleteFlashcardAtIndex} from "src/deck";
import {Card, ReviewResponse} from "src/scheduling";
import {FlashcardModal} from "src/flashcard-modal";
import {MarkdownView, WorkspaceLeaf} from "obsidian";
import {burySiblingCards} from "src/modal-utils";

export function createResetLinkButton(currentDeck: Deck, ignoreStats: boolean) {
    let resetLinkDiv = this.contentEl.createDiv("sr-link");
    resetLinkDiv.setText(t("RESET_CARD_PROGRESS"));
    resetLinkDiv.addEventListener("click", async () => {
        await this.processReview(ReviewResponse.Reset, ignoreStats, currentDeck, this.currentCard, this.currentCardIdx, this);
    });
    resetLinkDiv.style.float = "right";
    return resetLinkDiv;
}

function createButton(buttonId: string, buttonText: string) {
    const buttonElement = document.createElement("button");
    buttonElement.setAttribute("id", buttonId);
    buttonElement.setText(buttonText);
    return buttonElement;
}

function createButtonWithListener(currentDeck: Deck, buttonText: string, state: FlashcardModal, buttonId: string, ignoreStats?: boolean, reviewResponse?: ReviewResponse) {
    const buttonElement = createButton(buttonId, buttonText);
    buttonElement.addEventListener("click", async () => {
        await state.processReview(reviewResponse, ignoreStats, currentDeck, state.currentCard, state.currentCardIdx, state);
    });
    if (ignoreStats) {
        if (reviewResponse == ReviewResponse.Good)
            buttonElement.style.display = "none";
        else
            buttonElement.addClass("sr-ignorestats-btn");
    }
    return buttonElement;
}

export function createResponseButtons(ignoreStats: boolean, currentDeck1: Deck, flashcardHardText: string, flashcardGoodText: string, flashcardEasyText: string, state: FlashcardModal) {
    const hardButton = createButtonWithListener(currentDeck1, flashcardHardText, state, "sr-hard-btn", ignoreStats, ReviewResponse.Hard);
    const goodButton = createButtonWithListener(currentDeck1, flashcardGoodText, state, "sr-good-btn", ignoreStats, ReviewResponse.Good);
    const easyButton = createButtonWithListener(currentDeck1, flashcardEasyText, state, "sr-easy-btn", ignoreStats, ReviewResponse.Easy);
    return {hardBtn: hardButton, goodBtn: goodButton, easyBtn: easyButton};
}

export function createAnswerBtn(state: FlashcardModal) {
    const answerBtn = createButton("sr-show-answer", t("SHOW_ANSWER"));
    answerBtn.addEventListener("click", () => {
        state.showAnswer();
    });
    return answerBtn;
}

export function createEditLaterButton(contentEl: HTMLElement, currentDeck: Deck, currentCard: Card, index: number) {
    const fileLinkView = contentEl.createDiv("sr-link");
    fileLinkView.setText(t("EDIT_LATER"));
    if (this.plugin.data.settings.showFileNameInFileLink) {
        fileLinkView.setAttribute("aria-label", t("EDIT_LATER"));
    }
    fileLinkView.addEventListener("click", async () => {
        const activeLeaf: WorkspaceLeaf = this.plugin.app.workspace.getLeaf();
        if (this.plugin.app.workspace.getActiveFile() === null) {
            // TODO: this.currentCard is part of state and gets out of sync if extracted
            await activeLeaf.openFile(this.currentCard.note);
        } else {
            const newLeaf = this.plugin.app.workspace.createLeafBySplit(
                activeLeaf,
                "vertical",
                false
            );
            await newLeaf.openFile(this.currentCard.note, {active: true});
        }
        const activeView: MarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
        activeView.editor.setCursor({
            line: this.currentCard.lineNo,
            ch: 0,
        });
        currentDeck = deleteFlashcardAtIndex(index, this.currentCard.isDue, currentDeck);
        burySiblingCards(false, this.currentCard, currentDeck);
        currentDeck.nextCard(this, currentDeck);
    });
    return fileLinkView;
}