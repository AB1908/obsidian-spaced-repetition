import React from "react";
import { Modal, TextAreaComponent } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import SRPlugin from "src/main";
import { generateSeparator, removeSchedTextFromCard } from "src/sched-utils";
import { replacedCardText } from "src/edit-utils";
import { Card } from "src/Card";
import { QuestionEdit, AnswerEdit } from "../components/edit-card-text-areas";
import { CardType } from "src/scheduling";

// from https://github.com/chhoumann/quickadd/blob/bce0b4cdac44b867854d6233796e3406dfd163c6/src/gui/GenericInputPrompt/GenericInputPrompt.ts#L5
export class FlashcardEditModal extends Modal {
    public plugin: SRPlugin;
    public waitForClose: Promise<Card>;

    private resolvePromise: (input: Card) => void;
    private rejectPromise: (reason?: any) => void;
    private didSubmit: boolean = false;
    private contentRoot: Root;
    private card: Card;
    private questionText: string;
    private answerText: string;

    public static Prompt(plugin: SRPlugin, card: Card): Promise<Card> {
        const newPromptModal = new FlashcardEditModal(plugin, "", card);
        return newPromptModal.waitForClose;
    }

    // todo: handle clozes more elegantly
    constructor(plugin: SRPlugin, existingText: string, card: Card) {
        super(plugin.app);
        this.plugin = plugin;
        this.titleEl.setText("Edit Card");
        this.card = card;
        this.questionText = removeSchedTextFromCard(this.card.front, generateSeparator(this.card.cardText, plugin.data.settings.cardCommentOnSameLine));
        this.answerText = removeSchedTextFromCard(this.card.back, generateSeparator(this.card.cardText, plugin.data.settings.cardCommentOnSameLine));

        this.waitForClose = new Promise<Card>((resolve, reject) => {
            this.resolvePromise = resolve;
            this.rejectPromise = reject;
        });
        this.display();
        this.open();
    }

    private display() {
        this.contentEl.empty();
        this.titleEl.textContent = "Edit Flashcard";
        this.modalEl.addClass("sr-input-modal");
        this.contentRoot = createRoot(this.contentEl);
        this.contentRoot.render(
            <EditModal
                onClickCancel={(_e) => this.close()}
                onClickSubmit={(_e) => this.submit()}
                questionText = {this.questionText}
                answerText={this.answerText}
                answerChangeHandler={(event: React.ChangeEvent<HTMLInputElement>) => { this.answerText = event.target.value}} 
                onKeyDown = {(e) => this.submitEnterCallback(e)}
                questionChangeHandler = {(event) => { this.questionText = event.target.value; }}
                cardtype = {this.card.cardType}
            />
        )
    }

    private submitEnterCallback = (evt: React.KeyboardEvent) => {
    if ((evt.ctrlKey || evt.metaKey) && evt.key === "Enter") {
        evt.preventDefault();
        this.submit();
    }
};

    private submit() {
    this.didSubmit = true;
    this.close();
}

onClose() {
    super.onClose();
    this.resolveInput();
}

    private resolveInput() {
    if (!this.didSubmit) this.resolvePromise(this.card);
    else {
        if ((this.questionText === this.card.front) && (this.answerText === this.card.back)) {
            this.resolvePromise(this.card);
        } else {
            let output: Card = { ...this.card }
            const front = this.card.front;
            const cardText = this.card.cardText;
            const questionText = this.questionText;
            const back = this.card.back;
            const answerText = this.answerText;
            output.cardText = replacedCardText(front, output, cardText, questionText, back, answerText, this.plugin.data.settings.cardCommentOnSameLine);
            this.resolvePromise(output);
        }
    }
}
}

function EditModal({ questionText, onKeyDown, questionChangeHandler, answerChangeHandler, answerText, onClickSubmit, onClickCancel, cardtype: cardType }: { questionText: string, onKeyDown: (e: React.KeyboardEvent) => void,  questionChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void, answerChangeHandler: (e: React.ChangeEvent<HTMLInputElement>) => void, answerText: string, onClickSubmit: (e: React.MouseEvent) => void, onClickCancel: (e: React.MouseEvent) => void, cardtype: CardType }) {
    if (cardType == CardType.Cloze) {
        return (
            <div className="sr-input-area">
                <QuestionEdit
                    questionText={questionText}
                    onKeyDown={onKeyDown}
                    onChange={questionChangeHandler}
            />
                <div className="modal-button-container">
                    <button className="mod-cta" onClick={onClickSubmit}>
                        Submit
                    </button>
                    <button onClick={onClickCancel}>Cancel</button>
                </div>
            </div>
        )    
    } else
    return (
        <div className="sr-input-area">
            <QuestionEdit
                questionText={questionText}
                onKeyDown={onKeyDown}
                onChange={questionChangeHandler}
            />
            <AnswerEdit
                answerText={answerText}
                onKeyDown={onKeyDown}
                onChange={answerChangeHandler}
            />
            <div className="modal-button-container">
                <button className="mod-cta" onClick={onClickSubmit}>
                    Submit
                </button>
                <button onClick={onClickCancel}>Cancel</button>
            </div>
        </div>
    )
}
