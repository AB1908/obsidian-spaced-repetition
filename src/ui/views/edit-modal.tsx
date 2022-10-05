import {App, ButtonComponent, Modal, TextAreaComponent} from "obsidian";
import SRPlugin from "src/main";

// from https://github.com/chhoumann/quickadd/blob/bce0b4cdac44b867854d6233796e3406dfd163c6/src/gui/GenericInputPrompt/GenericInputPrompt.ts#L5
export class FlashcardEditModal extends Modal {
    public plugin: SRPlugin;
    public input: string;
    public waitForClose: Promise<string>;

    private resolvePromise: (input: string) => void;
    private rejectPromise: (reason?: any) => void;
    private didSubmit: boolean = false;
    private inputComponent: TextAreaComponent;
    private readonly modalText: string;

    public static Prompt(app: App, plugin: SRPlugin, placeholder: string): Promise<string> {
        const newPromptModal = new FlashcardEditModal(app, plugin, placeholder);
        return newPromptModal.waitForClose;
    }

    constructor(app: App, plugin: SRPlugin, existingText: string) {
        super(app);
        this.plugin = plugin;
        this.titleEl.setText("Edit Card");
        this.modalText = existingText;

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

        const mainContentContainer: HTMLDivElement = this.contentEl.createDiv();
        mainContentContainer.addClass("sr-input-area");
        this.inputComponent = this.createInputField(mainContentContainer, this.modalText);
        this.createButtonBar(mainContentContainer);
    }

    private createButton(container: HTMLElement, text: string, callback: (evt: MouseEvent) => any) {
        const btn = new ButtonComponent(container);
        btn.setButtonText(text).onClick(callback);

        return btn;
    }

    private createButtonBar(mainContentContainer: HTMLDivElement) {
        const buttonBarContainer: HTMLDivElement = mainContentContainer.createDiv();
        this.createButton(
            buttonBarContainer,
            "Ok",
            this.submitClickCallback
        ).setCta().buttonEl.style.marginRight = "0";
        this.createButton(buttonBarContainer, "Cancel", this.cancelClickCallback);

        buttonBarContainer.style.display = "flex";
        buttonBarContainer.style.flexDirection = "row-reverse";
        buttonBarContainer.style.justifyContent = "flex-start";
        buttonBarContainer.style.marginTop = "1rem";
    }

    protected createInputField(container: HTMLElement, value: string) {
        const textComponent = new TextAreaComponent(container);

        textComponent.inputEl.style.width = "100%";
        textComponent
            .setValue(value ?? "")
            .onChange((value) => (this.input = value))
            .inputEl.addEventListener("keydown", this.submitEnterCallback);

        return textComponent;
    }

    private submitClickCallback = (evt: MouseEvent) => this.submit();
    private cancelClickCallback = (evt: MouseEvent) => this.cancel();

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

    private cancel() {
        this.close();
    }

    onOpen() {
        super.onOpen();

        this.inputComponent.inputEl.focus();
    }

    onClose() {
        super.onClose();
        this.resolveInput();
        this.removeInputListener();
    }

    private resolveInput() {
        if (!this.didSubmit) this.rejectPromise("No input given.");
        else this.resolvePromise(this.input);
    }

    private removeInputListener() {
        this.inputComponent.inputEl.removeEventListener("keydown", this.submitEnterCallback);
    }
}