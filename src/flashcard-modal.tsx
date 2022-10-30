import {
    App,
    MarkdownRenderer,
    MarkdownView,
    Modal,
    Notice,
    Platform,
    TFile,
    WorkspaceLeaf,
} from "obsidian";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import h from "vhtml";

import type SRPlugin from "src/main";
import { Card, CardType, ReviewResponse, schedule } from "src/scheduling";
import {
    AUDIO_FORMATS,
    IMAGE_FORMATS,
    LEGACY_SCHEDULING_EXTRACTOR,
    MULTI_SCHEDULING_EXTRACTOR,
    VIDEO_FORMATS,
} from "src/constants";
import { cyrb53, escapeRegexString } from "src/utils";
import { t } from "src/lang/helpers";
import { Deck } from "src/deck";

export enum FlashcardModalMode {
    DecksList,
    Front,
    Back,
    Closed,
}

function extractFileMatches(src: string, currentNotePath: string) {
    const linkComponentsRegex = /^(?<file>[^#^]+)?(?:#(?!\^)(?<heading>.+)|#\^(?<blockId>.+)|#)?$/;
    const matched = typeof src === "string" && src.match(linkComponentsRegex);
    const file = matched.groups.file || currentNotePath;
    return { matched, file };
}

function renderDecks(decks: Deck[], containerEl: HTMLElement, modal: FlashcardModal) {
    for (const deck of decks) {
        deck.render(containerEl, modal);
    }
}

function createEditLaterButton(contentEl: HTMLElement, currentDeck: Deck, currentCard: Card, index: number) {
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
        currentDeck.deleteFlashcardAtIndex(index, this.currentCard.isDue);
        burySiblingCards(false, this.currentCard, currentDeck);
        currentDeck.nextCard(this);
    });
    return fileLinkView;
}

function generateNewSchedulingText(currentCard: Card, sep: string, dueString: string, interval: number, ease: number) {
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

        const currCardSched: string[] = ["0", dueString, interval.toString(), ease.toString()];
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

        document.body.onkeydown = (e) => {
            if (this.mode !== FlashcardModalMode.DecksList) {
                if (this.mode !== FlashcardModalMode.Closed && e.code === "KeyS") {
                    this.currentDeck.deleteFlashcardAtIndex(
                        this.currentCardIdx,
                        this.currentCard.isDue
                    );
                    burySiblingCards(false, this.currentCard, this.currentDeck);
                    this.currentDeck.nextCard(this);
                } else if (
                    this.mode === FlashcardModalMode.Front &&
                    (e.code === "Space" || e.code === "Enter")
                ) {
                    this.showAnswer();
                } else if (this.mode === FlashcardModalMode.Back) {
                    if (e.code === "Numpad1" || e.code === "Digit1") {
                        this.processReview(ReviewResponse.Hard, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
                    } else if (e.code === "Numpad2" || e.code === "Digit2" || e.code === "Space") {
                        this.processReview(ReviewResponse.Good, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
                    } else if (e.code === "Numpad3" || e.code === "Digit3") {
                        this.processReview(ReviewResponse.Easy, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
                    } else if (e.code === "Numpad0" || e.code === "Digit0") {
                        this.processReview(ReviewResponse.Reset, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
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
            deck.nextCard(this);
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
        this.contentEl.innerHTML = "";
        const historyLinkView = this.contentEl.createEl("button");

        historyLinkView.setText("〈");
        historyLinkView.addEventListener("click", (e: PointerEvent) => {
            if (e.pointerType.length > 0) {
                this.plugin.data.historyDeck = "";
                this.decksList();
            }
        });
        this.fileLinkView = createEditLaterButton.call(this, this.contentEl, this.currentDeck, this.currentCard, this.currentCardIdx);

        this.resetLinkView = this.contentEl.createDiv("sr-link");
        this.resetLinkView.setText(t("RESET_CARD_PROGRESS"));
        this.resetLinkView.addEventListener("click", () => {
            this.processReview(ReviewResponse.Reset, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
        });
        this.resetLinkView.style.float = "right";

        if (this.plugin.data.settings.showContextInCards) {
            this.contextView = this.contentEl.createDiv();
            this.contextView.setAttribute("id", "sr-context");
        }

        this.flashcardView = this.contentEl.createDiv("div");
        this.flashcardView.setAttribute("id", "sr-flashcard-view");

        this.responseDiv = this.contentEl.createDiv("sr-response");

        this.hardBtn = document.createElement("button");
        this.hardBtn.setAttribute("id", "sr-hard-btn");
        this.hardBtn.setText(this.plugin.data.settings.flashcardHardText);
        this.hardBtn.addEventListener("click", () => {
            this.processReview(ReviewResponse.Hard, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
        });
        this.responseDiv.appendChild(this.hardBtn);

        this.goodBtn = document.createElement("button");
        this.goodBtn.setAttribute("id", "sr-good-btn");
        this.goodBtn.setText(this.plugin.data.settings.flashcardGoodText);
        this.goodBtn.addEventListener("click", () => {
            this.processReview(ReviewResponse.Good, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
        });
        this.responseDiv.appendChild(this.goodBtn);

        this.easyBtn = document.createElement("button");
        this.easyBtn.setAttribute("id", "sr-easy-btn");
        this.easyBtn.setText(this.plugin.data.settings.flashcardEasyText);
        this.easyBtn.addEventListener("click", () => {
            this.processReview(ReviewResponse.Easy, this.ignoreStats, this.currentDeck, this.currentCard, this.currentCardIdx);
        });
        this.responseDiv.appendChild(this.easyBtn);
        this.responseDiv.style.display = "none";

        this.answerBtn = this.contentEl.createDiv();
        this.answerBtn.setAttribute("id", "sr-show-answer");
        this.answerBtn.setText(t("SHOW_ANSWER"));
        this.answerBtn.addEventListener("click", () => {
            this.showAnswer();
        });

        if (this.ignoreStats) {
            this.goodBtn.style.display = "none";

            this.responseDiv.addClass("sr-ignorestats-response");
            this.easyBtn.addClass("sr-ignorestats-btn");
            this.hardBtn.addClass("sr-ignorestats-btn");
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

    async processReview(response: ReviewResponse, ignoreStats: boolean, currentDeck: Deck, currentCard: Card, index: number): Promise<void> {
        if (ignoreStats) {
            this.processCrammedCards(response, currentDeck, index, currentCard);
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
                    this.plugin.data.settings,
                    this.plugin.dueDatesFlashcards
                );
            } else {
                let initial_ease: number = this.plugin.data.settings.baseEase;
                if (
                    Object.prototype.hasOwnProperty.call(
                        this.plugin.easeByPath,
                        currentCard.note.path
                    )
                ) {
                    initial_ease = Math.round(this.plugin.easeByPath[currentCard.note.path]);
                }

                schedObj = schedule(
                    response,
                    1.0,
                    initial_ease,
                    0,
                    this.plugin.data.settings,
                    this.plugin.dueDatesFlashcards
                );
                interval = schedObj.interval;
                ease = schedObj.ease;
            }

            interval = schedObj.interval;
            ease = schedObj.ease;
            due = window.moment(Date.now() + interval * 24 * 3600 * 1000);
        } else {
            this.resetCardProgress(currentCard, currentDeck);
            return;
        }

        const dueString: string = due.format("YYYY-MM-DD");

        let fileText: string = await this.app.vault.read(currentCard.note);
        const replacementRegex = new RegExp(escapeRegexString(currentCard.cardText), "gm");

        let sep: string = this.plugin.data.settings.cardCommentOnSameLine ? " " : "\n";
        // Override separator if last block is a codeblock
        if (currentCard.cardText.endsWith("```") && sep !== "\n") {
            sep = "\n";
        }
        generateNewSchedulingText(currentCard, sep, dueString, interval, ease);

        fileText = fileText.replace(replacementRegex, () => currentCard.cardText);
        for (const sibling of currentCard.siblings) {
            sibling.cardText = currentCard.cardText;
        }

        currentDeck.deleteFlashcardAtIndex(index, currentCard.isDue);
        if (this.plugin.data.settings.burySiblingCards) {
            burySiblingCards(true, currentCard, currentDeck);
        }
        await this.app.vault.modify(currentCard.note, fileText);
        currentDeck.nextCard(this);
    }

    private processCrammedCards(response: ReviewResponse, currentDeck: Deck, index: number, currentCard: Card) {
        if (response == ReviewResponse.Easy) {
            currentDeck.deleteFlashcardAtIndex(
                index,
                currentCard.isDue
            );
        }
        currentDeck.nextCard(this);
    }

    private resetCardProgress(currentCard: Card, currentDeck: Deck) {
        currentCard.interval = 1.0;
        currentCard.ease = this.plugin.data.settings.baseEase;
        if (currentCard.isDue) {
            currentDeck.dueFlashcards.push(currentCard);
        } else {
            currentDeck.newFlashcards.push(currentCard);
        }
        // due = window.moment(Date.now());
        new Notice(t("CARD_PROGRESS_RESET"));
        currentDeck.nextCard(this);
    }

// slightly modified version of the renderMarkdown function in
    // https://github.com/mgmeyers/obsidian-kanban/blob/main/src/KanbanView.tsx
    async renderMarkdownWrapper(
        markdownString: string,
        containerEl: HTMLElement,
        recursiveDepth = 0
    ): Promise<void> {
        if (recursiveDepth > 4) return;

        MarkdownRenderer.renderMarkdown(
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

        this.renderMarkdownWrapper(blockText, el, recursiveDepth + 1);
    }
}

async function burySiblingCards(
    tillNextDay: boolean,
    currentCard1: Card,
    currentDeck1: Deck
): Promise<void> {
    if (tillNextDay) {
        this.plugin.data.buryList.push(cyrb53(currentCard1.cardText));
        await this.plugin.savePluginData();
    }

    for (const sibling of currentCard1.siblings) {
        const dueIdx = currentDeck1.dueFlashcards.indexOf(sibling);
        const newIdx = currentDeck1.newFlashcards.indexOf(sibling);

        if (dueIdx !== -1) {
            currentDeck1.deleteFlashcardAtIndex(dueIdx, currentDeck1.dueFlashcards[dueIdx].isDue);
        } else if (newIdx !== -1) {
            currentDeck1.deleteFlashcardAtIndex(newIdx, currentDeck1.newFlashcards[newIdx].isDue);
        }
    }
}
