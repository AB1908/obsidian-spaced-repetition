import React from "react";
import {Modal} from "obsidian";
import {createRoot, Root} from "react-dom/client";
import SRPlugin from "src/main";
import {Card} from "src/scheduling";
import {escapeRegexString} from "src/utils";
import {removeSchedTextFromCard} from "src/sched-utils";

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
        const newPromptModal = new FlashcardEditModal(plugin,"" , card);
        return newPromptModal.waitForClose;
    }

    constructor(plugin: SRPlugin, existingText: string, card: Card) {
        super(plugin.app);
        this.plugin = plugin;
        this.titleEl.setText("Edit Card");
        this.card = card;
        this.questionText = String(card.front);
        // this.questionText = "";
        console.log(this.card)
        this.answerText = card.back;

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
            (
                <div className="sr-input-area">
                    <h3>Question</h3>
                    <textarea spellCheck="false"
                        style={{ width: "100%" }}
                              className={"question"}
                        defaultValue={this.card.front}
                        // TODO: Fix this weird casting
                        onKeyDown={(e) => this.submitEnterCallback(e as unknown as KeyboardEvent)}
                        onChange={(event) => { this.questionText = event.target.value; }}
                    />
                    <h3>Answer</h3>
                    <textarea spellCheck="false"
                              className={"answer"}
                              style={{ width: "100%" }}
                              defaultValue={removeSchedTextFromCard(this.card.back, "")}
                              // TODO: Fix this weird casting
                              onKeyDown={(e) => this.submitEnterCallback(e as unknown as KeyboardEvent)}
                              onChange={(event) => { this.answerText = event.target.value }}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                            justifyContent: "flex-start",
                            marginTop: "1rem"
                        }}
                    >
                        <button className="mod-cta" style={{ marginRight: 0 }} onClick={(_e) => this.submit()}>
                            Submit
                        </button>
                        <button onClick={(_e) => this.close()}>Cancel</button>
                    </div>
                </div>
            )
        )
    }

    private submitEnterCallback = (evt: KeyboardEvent) => {
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
                const output: Card = {...this.card}
                const frontReplacementRegex = new RegExp(escapeRegexString(this.card.front), "gm");
                output.cardText = this.card.cardText.replace(frontReplacementRegex, this.questionText);
                const backReplacementRegex = new RegExp(escapeRegexString(removeSchedTextFromCard(this.card.back, "")), "gm");
                output.cardText = output.cardText.replace(backReplacementRegex, this.answerText);
                this.resolvePromise(output);
            }
        }
    }
}