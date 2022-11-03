import {App, MarkdownRenderer, Modal, Platform, TFile,} from "obsidian";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import h from "vhtml";

import type SRPlugin from "src/main";
import {Card, CardType, ReviewResponse} from "src/scheduling";
import {AUDIO_FORMATS, IMAGE_FORMATS, VIDEO_FORMATS,} from "src/constants";
import {escapeRegexString} from "src/utils";
import {t} from "src/lang/helpers";
import {Deck, deleteFlashcardAtIndex} from "src/deck";
import {
    buryCardAndSiblings,
    burySiblingCards,
    calculateSchedInfo,
    extractFileMatches,
    generateNewSchedulingText,
    getCardTextSeparator,
    processCrammedCards,
    renderDecks,
    resetCardProgress
} from "src/modal-utils";
import {SRSettings} from "src/settings";
import {createAnswerBtn, createEditLaterButton, createResetLinkButton, createResponseButtons} from "src/buttons";

export enum FlashcardModalMode {
    DecksList,
    Front,
    Back,
    Closed,
}

export class FlashcardModal extends Modal {
    public plugin: SRPlugin;
    public answerBtn: HTMLElement;
    public flashcardView: HTMLElement;
    public hardBtn: HTMLElement;
    public goodBtn: HTMLElement;
    public easyBtn: HTMLElement;
    // public nextBtn: HTMLElement;
    public responseDiv: HTMLElement;
    public fileLinkView: HTMLElement;
    public resetLinkView: HTMLElement;
    public contextView: HTMLElement;
    public currentCard: Card;
    public currentCardIdx: number;
    public currentDeck: Deck;
    public checkDeck: Deck;
    public mode: FlashcardModalMode;
    public ignoreStats: boolean;

    constructor(app: App, plugin: SRPlugin, ignoreStats = false) {
        super(app);

        this.plugin = plugin;
        this.ignoreStats = ignoreStats;

        this.titleEl.setText(t("DECKS"));

        if (Platform.isMobile) {
            this.contentEl.style.display = "block";
        }
        this.modalEl.style.height = this.plugin.data.settings.flashcardHeightPercentage + "%";
        this.modalEl.style.width = this.plugin.data.settings.flashcardWidthPercentage + "%";

        this.contentEl.style.position = "relative";
        this.contentEl.style.height = "92%";
        this.contentEl.addClass("sr-modal-content");

        document.body.onkeydown = async (e) => {
            if (this.mode !== FlashcardModalMode.DecksList) {
                if (this.mode !== FlashcardModalMode.Closed && e.code === "KeyS") {
                    this.currentDeck = deleteFlashcardAtIndex(this.currentCardIdx, this.currentCard.isDue, this.currentDeck);
                    this.currentDeck = await burySiblingCards(false, this.currentCard, this.currentDeck);
                    this.currentDeck.nextCard(this, this.currentDeck);
                } else if (
                    this.mode === FlashcardModalMode.Front &&
                    (e.code === "Space" || e.code === "Enter")
                ) {
                    this.showAnswer();
                } else if (this.mode === FlashcardModalMode.Back) {
                    if (e.code === "Numpad1" || e.code === "Digit1") {
                        await this.processReview(ReviewResponse.Hard, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx, this);
                    } else if (e.code === "Numpad2" || e.code === "Digit2" || e.code === "Space") {
                        await this.processReview(ReviewResponse.Good, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx, this);
                    } else if (e.code === "Numpad3" || e.code === "Digit3") {
                        await this.processReview(ReviewResponse.Easy, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx, this);
                    } else if (e.code === "Numpad0" || e.code === "Digit0") {
                        await this.processReview(ReviewResponse.Reset, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx, this);
                    }
                }
            }
        };
    }

    onOpen(): void {
        this.decksList();
    }

    onClose(): void {
        this.mode = FlashcardModalMode.Closed;
    }

    decksList(): void {
        const titleContent = (
                <p style="margin:0px;line-height:12px;">
                    <span
                        style="background-color:#4caf50;color:#ffffff;"
                        aria-label={t("DUE_CARDS")}
                        class="tag-pane-tag-count tree-item-flair"
                    >
                        {this.plugin.deckTree.dueFlashcardsCount.toString()}
                    </span>
                    <span
                        style="background-color:#2196f3;"
                        aria-label={t("NEW_CARDS")}
                        class="tag-pane-tag-count tree-item-flair sr-deck-counts"
                    >
                        {this.plugin.deckTree.newFlashcardsCount.toString()}
                    </span>
                    <span
                        style="background-color:#ff7043;"
                        aria-label={t("TOTAL_CARDS")}
                        class="tag-pane-tag-count tree-item-flair sr-deck-counts"
                    >
                        {this.plugin.deckTree.totalFlashcards.toString()}
                    </span>
                </p>
        );

        const aimDeck = this.plugin.deckTree.subdecks.filter(
            (deck) => deck.deckName === this.plugin.data.historyDeck
        );
        if (this.plugin.data.historyDeck && aimDeck.length > 0) {
            const deck = aimDeck[0];
            this.currentDeck = deck;
            this.checkDeck = deck.parent;
            this.setupCardsView();
            deck.nextCard(this, deck);
            return;
        }

        this.mode = FlashcardModalMode.DecksList;
        this.titleEl.setText(t("DECKS"));
        this.titleEl.innerHTML += titleContent;
        this.contentEl.innerHTML = "";
        this.contentEl.setAttribute("id", "sr-flashcard-view");

        const decks = this.plugin.deckTree.subdecks;
        const containerEl = this.contentEl;
        const modal: FlashcardModal = this;
        renderDecks(decks, containerEl, modal);
    }

    setupCardsView(): void {
        this.contentEl.empty();
        const historyLinkView = this.contentEl.createEl("button");

        historyLinkView.setText("〈");
        historyLinkView.addEventListener("click", (e: PointerEvent) => {
            if (e.pointerType.length > 0) {
                this.plugin.data.historyDeck = "";
                this.decksList();
            }
        });

        let currentDeck1 = this.currentDeck;
        let ignoreStats = this.ignoreStats;

        this.fileLinkView = createEditLaterButton.call(this, this.contentEl, currentDeck1, this.currentCard, this.currentCardIdx);
        this.resetLinkView = createResetLinkButton.call(this, currentDeck1, ignoreStats);

        if (this.plugin.data.settings.showContextInCards) {
            this.contextView = this.contentEl.createDiv();
            this.contextView.setAttribute("id", "sr-context");
        }

        this.flashcardView = this.contentEl.createDiv("div");
        this.flashcardView.setAttribute("id", "sr-flashcard-view");

        this.responseDiv = this.contentEl.createDiv("sr-response");

        const __ret = createResponseButtons(ignoreStats, currentDeck1, this.plugin.data.settings.flashcardHardText, this.plugin.data.settings.flashcardGoodText, this.plugin.data.settings.flashcardEasyText, this);
        this.hardBtn = __ret.hardBtn;
        this.goodBtn = __ret.goodBtn;
        this.easyBtn = __ret.easyBtn;

        this.responseDiv.appendChild(this.hardBtn);
        this.responseDiv.appendChild(this.goodBtn);
        this.responseDiv.appendChild(this.easyBtn);

        this.responseDiv.style.display = "none";

        this.answerBtn = createAnswerBtn(this);
        this.contentEl.appendChild(this.answerBtn)

        if (ignoreStats) {
            this.responseDiv.addClass("sr-ignorestats-response");
        }
    }

    showAnswer(): void {
        this.mode = FlashcardModalMode.Back;

        this.answerBtn.style.display = "none";
        this.responseDiv.style.display = "grid";

        if (this.currentCard.isDue) {
            this.resetLinkView.style.display = "inline-block";
        }

        if (this.currentCard.cardType !== CardType.Cloze) {
            const hr: HTMLElement = document.createElement("hr");
            hr.setAttribute("id", "sr-hr-card-divide");
            this.flashcardView.appendChild(hr);
        } else {
            this.flashcardView.innerHTML = "";
        }

        this.renderMarkdownWrapper(this.currentCard.back, this.flashcardView);
    }

    async processReview(response: ReviewResponse, ignoreStats: boolean, currentDeck: Deck, currentCard: Card, index: number, state: FlashcardModal): Promise<void> {
        if (ignoreStats) {
            currentDeck = processCrammedCards(response, state.currentDeck, index, currentCard);
        } else {
            currentDeck = await this.processCardResponse(response, currentCard, currentDeck, index, this.plugin.dueDatesFlashcards, this.plugin.easeByPath, this.plugin.data.settings.baseEase, this.plugin.data.settings.cardCommentOnSameLine, this.plugin.data.settings.burySiblingCards, this.plugin.data.settings);
        }
        currentDeck.nextCard(this, currentDeck);
    }

    private async processCardResponse(response: ReviewResponse | ReviewResponse.Easy | ReviewResponse.Good | ReviewResponse.Hard, currentCard: Card, currentDeck: Deck, index: number, dueDatesFlashcards: Record<number, number>, easeByPath: Record<string, number>, baseEase: number, isCardCommentOnSameLine: boolean, shouldBurySiblings: boolean, pluginSettings: SRSettings): Promise<Deck> {
        if (response === ReviewResponse.Reset) {
            currentDeck = resetCardProgress(currentCard, currentDeck, baseEase);
        } else {
            const __ret = calculateSchedInfo(currentCard, response, pluginSettings, dueDatesFlashcards, easeByPath);
            const interval = __ret.interval;
            const ease = __ret.ease;
            const due = __ret.due;
            const cardText = currentCard.cardText;
            const sep = getCardTextSeparator(cardText, isCardCommentOnSameLine);
            const newCardText = generateNewSchedulingText(sep, due.format("YYYY-MM-DD"), interval, ease, cardText, currentCard.isDue, currentCard.siblingIdx);

            for (const sibling of currentCard.siblings) {
                sibling.cardText = newCardText;
            }

            let fileText: string = await this.app.vault.read(currentCard.note);
            const replacementRegex = new RegExp(escapeRegexString(cardText), "gm");
            fileText = fileText.replace(replacementRegex, () => newCardText);
            currentDeck = await buryCardAndSiblings(currentDeck, index, currentCard, shouldBurySiblings);
            await this.plugin.app.vault.modify(currentCard.note, fileText);
        }
        return currentDeck;
    }



// slightly modified version of the renderMarkdown function in
    // https://github.com/mgmeyers/obsidian-kanban/blob/main/src/KanbanView.tsx
    async renderMarkdownWrapper(
        markdownString: string,
        containerEl: HTMLElement,
        recursiveDepth = 0
    ): Promise<void> {
        if (recursiveDepth > 4) return;

        await MarkdownRenderer.renderMarkdown(
            markdownString,
            containerEl,
            this.currentCard.note.path,
            this.plugin
        );

        containerEl.findAll(".internal-embed").forEach((el) => {
            const link = this.parseLink(el.getAttribute("src"));

            // file does not exist, display dead link
            if (!link.target) {
                el.innerText = link.text;
            } else if (link.target instanceof TFile) {
                if (link.target.extension !== "md") {
                    this.embedMediaFile(el, link.target);
                } else {
                    el.innerText = "";
                    this.renderTransclude(el, link, recursiveDepth);
                }
            }
        });
    }

    parseLink(src: string) {
        const currentNotePath = this.currentCard.note.path;
        const { matched, file } = extractFileMatches(src, currentNotePath);

        const target = this.plugin.app.metadataCache.getFirstLinkpathDest(file, currentNotePath);
        // move lookup upstream? ^^^
        return {
            text: matched[0],
            file: matched.groups.file,
            heading: matched.groups.heading,
            blockId: matched.groups.blockId,
            target: target,
        };
    }

    embedMediaFile(el: HTMLElement, target: TFile) {
        el.innerText = "";
        if (IMAGE_FORMATS.includes(target.extension)) {
            el.createEl(
                "img",
                {
                    attr: {
                        src: this.plugin.app.vault.getResourcePath(target),
                    },
                },
                (img) => {
                    if (el.hasAttribute("width"))
                        img.setAttribute("width", el.getAttribute("width"));
                    else img.setAttribute("width", "100%");
                    if (el.hasAttribute("alt")) img.setAttribute("alt", el.getAttribute("alt"));
                    el.addEventListener(
                        "click",
                        (ev) =>
                            ((ev.target as HTMLElement).style.minWidth =
                                (ev.target as HTMLElement).style.minWidth === "100%"
                                    ? null
                                    : "100%")
                    );
                }
            );
            el.addClasses(["image-embed", "is-loaded"]);
        } else if (
            AUDIO_FORMATS.includes(target.extension) ||
            VIDEO_FORMATS.includes(target.extension)
        ) {
            el.createEl(
                AUDIO_FORMATS.includes(target.extension) ? "audio" : "video",
                {
                    attr: {
                        controls: "",
                        src: this.plugin.app.vault.getResourcePath(target),
                    },
                },
                (audio) => {
                    if (el.hasAttribute("alt")) audio.setAttribute("alt", el.getAttribute("alt"));
                }
            );
            el.addClasses(["media-embed", "is-loaded"]);
        } else {
            el.innerText = target.path;
        }
    }

    async renderTransclude(
        el: HTMLElement,
        link: {
            text: string;
            file: string;
            heading: string;
            blockId: string;
            target: TFile;
        },
        recursiveDepth: number
    ) {
        const cache = this.app.metadataCache.getCache(link.target.path);
        const text = await this.app.vault.cachedRead(link.target);
        let blockText;
        if (link.heading) {
            const clean = (s: string) => s.replace(/[\W\s]/g, "");
            const headingIndex = cache.headings?.findIndex(
                (h) => clean(h.heading) === clean(link.heading)
            );
            const heading = cache.headings[headingIndex];

            const startAt = heading.position.start.offset;
            const endAt =
                cache.headings.slice(headingIndex + 1).find((h) => h.level <= heading.level)
                    ?.position?.start?.offset || text.length;

            blockText = text.substring(startAt, endAt);
        } else if (link.blockId) {
            const block = cache.blocks[link.blockId];
            const startAt = block.position.start.offset;
            const endAt = block.position.end.offset;
            blockText = text.substring(startAt, endAt);
        } else {
            blockText = text;
        }

        await this.renderMarkdownWrapper(blockText, el, recursiveDepth + 1);
    }
}