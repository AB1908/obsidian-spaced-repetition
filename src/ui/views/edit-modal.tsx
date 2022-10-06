import React from "react";
import { App, Modal } from "obsidian";
import { createRoot, Root } from "react-dom/client";
import SRPlugin from "src/main";

// from https://github.com/chhoumann/quickadd/blob/bce0b4cdac44b867854d6233796e3406dfd163c6/src/gui/GenericInputPrompt/GenericInputPrompt.ts#L5
export class FlashcardEditModal extends Modal {
    public plugin: SRPlugin;
    public input: string;
    public waitForClose: Promise<string>;

    private resolvePromise: (input: string) => void;
    private rejectPromise: (reason?: any) => void;
    private didSubmit: boolean = false;
    private contentRoot: Root;

    public static Prompt(app: App, plugin: SRPlugin, placeholder: string): Promise<string> {
        const newPromptModal = new FlashcardEditModal(app, plugin, placeholder);
        return newPromptModal.waitForClose;
    }

    constructor(app: App, plugin: SRPlugin, existingText: string) {
        super(app);
        this.plugin = plugin;
        this.titleEl.setText("Edit Card");
        this.input = existingText;

        this.waitForClose = new Promise<string>((resolve, reject) => {
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
                    <textarea spellCheck="false"
                        style={{ width: "100%" }}
                        defaultValue={this.input}
                        // TODO: Fix this weird casting
                        onKeyDown={(e) => this.submitEnterCallback(e as unknown as KeyboardEvent)}
                        onChange={(event) => { this.input = event.target.value; }}
                    />
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "row-reverse",
                            justifyContent: "flex-start",
                            marginTop: "1rem"
                        }}
                    >
                        <button className="mod-cta" style={{ marginRight: 0 }} onClick={(e) => this.submitClickCallback()}>
                            Submit
                        </button>
                        <button onClick={(e) => this.close()}>Cancel</button>
                    </div>
                </div>
            )
        )
    }

    private submitClickCallback = () => {
        this.submit();
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
        if (!this.didSubmit) this.rejectPromise("No input given.");
        else this.resolvePromise(this.input);
    }
}