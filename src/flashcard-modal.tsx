import {
    App, Modal, Platform,
    TFile
} from "obsidian";
import { createRoot, Root } from "react-dom/client";
import React from "react";

import {
    AUDIO_FORMATS, IMAGE_FORMATS, LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR, VIDEO_FORMATS
} from "src/constants";
import type SRPlugin from "src/main";
import { Card, ReviewResponse, schedule } from "src/scheduling";
import { cyrb53, escapeRegexString } from "src/utils";
import { ModalElement } from "./ui/modal";
import { Deck } from "./Deck";

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
    public nextBtn: HTMLElement;
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
    private modalRoot: Root;

    constructor(app: App, plugin: SRPlugin, ignoreStats = false) {
        super(app);

        this.plugin = plugin;
        this.ignoreStats = ignoreStats;

        if (Platform.isMobile) {
            this.contentEl.style.display = "block";
        }
        this.modalEl.style.height = this.plugin.data.settings.flashcardHeightPercentage + "%";
        this.modalEl.style.width = this.plugin.data.settings.flashcardWidthPercentage + "%";

        // this.contentEl.style.position = "relative";
        // this.contentEl.style.height = "92%";
        // this.contentEl.addClass("sr-modal-content");

        // document.body.onkeydown = (e) => {
        //     if (this.mode !== FlashcardModalMode.DecksList) {
        //         if (this.mode !== FlashcardModalMode.Closed && e.code === "KeyS") {
        //             this.currentDeck.deleteFlashcardAtIndex(
        //                 this.currentCardIdx,
        //                 this.currentCard.isDue
        //             );
        //             this.burySiblingCards(false);
        //             this.currentDeck.nextCard(this);
        //         } else if (
        //             this.mode === FlashcardModalMode.Front &&
        //             (e.code === "Space" || e.code === "Enter")
        //         ) {
        //             this.showAnswer();
        //         } else if (this.mode === FlashcardModalMode.Back) {
        //             if (e.code === "Numpad1" || e.code === "Digit1") {
        //                 this.processReview(ReviewResponse.Hard);
        //             } else if (e.code === "Numpad2" || e.code === "Digit2" || e.code === "Space") {
        //                 this.processReview(ReviewResponse.Good);
        //             } else if (e.code === "Numpad3" || e.code === "Digit3") {
        //                 this.processReview(ReviewResponse.Easy);
        //             } else if (e.code === "Numpad0" || e.code === "Digit0") {
        //                 this.processReview(ReviewResponse.Reset);
        //             }
        //         }
        //     }
        // };
    }

    onOpen(): void {
        this.modalRoot = createRoot(this.modalEl)
        console.log(this.modalEl)
        this.modalRoot.render(
            <>
                 <ModalElement
                     handleCloseButtonClick={() => this.close()}
                     processFlashcardAnswer={async (response: ReviewResponse, card: Card) =>
                         await this.processReview(response, card)
                     }
                     pluginData={this.plugin.data}
                 />
            </>
        )
    }

    onClose(): void {
        this.modalRoot.unmount();
    }

    // setupCardsView(): void {
    //     this.contentEl.innerHTML = "";
    //     const historyLinkView = this.contentEl.createEl("button");

    //     historyLinkView.setText("〈");
    //     historyLinkView.addEventListener("click", (e: PointerEvent) => {
    //         if (e.pointerType.length > 0) {
    //             this.plugin.data.historyDeck = "";
    //             this.decksList();
    //         }
    //     });

    //     this.fileLinkView = this.contentEl.createDiv("sr-link");
    //     this.fileLinkView.setText(t("EDIT_LATER"));
    //     if (this.plugin.data.settings.showFileNameInFileLink) {
    //         this.fileLinkView.setAttribute("aria-label", t("EDIT_LATER"));
    //     }
    //     this.fileLinkView.addEventListener("click", async () => {
    //         const activeLeaf: WorkspaceLeaf = this.plugin.app.workspace.getLeaf();
    //         if (this.plugin.app.workspace.getActiveFile() === null)
    //             await activeLeaf.openFile(this.currentCard.note);
    //         else {
    //             const newLeaf = this.plugin.app.workspace.createLeafBySplit(
    //                 activeLeaf,
    //                 "vertical",
    //                 false
    //             );
    //             await newLeaf.openFile(this.currentCard.note, { active: true });
    //         }
    //         const activeView: MarkdownView = this.app.workspace.getActiveViewOfType(MarkdownView);
    //         activeView.editor.setCursor({
    //             line: this.currentCard.lineNo,
    //             ch: 0,
    //         });
    //         this.currentDeck.deleteFlashcardAtIndex(this.currentCardIdx, this.currentCard.isDue);
    //         this.burySiblingCards(false);
    //         this.currentDeck.nextCard(this);
    //     });
    // }

    async processReview(response: ReviewResponse, currentCard: Card): Promise<void> {
        if (this.ignoreStats) {
            if (response == ReviewResponse.Easy) {
                // this.currentDeck.deleteFlashcardAtIndex(
                //     this.currentCardIdx,
                //     this.currentCard.isDue
                // );
            }
            // this.currentDeck.nextCard(this);
            return;
        }

        let interval: number, ease: number, due;

        // this.currentDeck.deleteFlashcardAtIndex(this.currentCardIdx, this.currentCard.isDue);
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
            // due = this.resetFlashcard(due);
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

        fileText = fileText.replace(replacementRegex, () => currentCard.cardText);
        for (const sibling of currentCard.siblings) {
            sibling.cardText = currentCard.cardText;
        }
        if (this.plugin.data.settings.burySiblingCards) {
            // this.burySiblingCards(true);
        }

        await this.app.vault.modify(currentCard.note, fileText);
        // this.currentDeck.nextCard(this);
    }

    // private resetFlashcard(due: any) {
    //     this.currentCard.interval = 1.0;
    //     this.currentCard.ease = this.plugin.data.settings.baseEase;
    //     if (this.currentCard.isDue) {
    //         this.currentDeck.dueFlashcards.push(this.currentCard);
    //     } else {
    //         this.currentDeck.newFlashcards.push(this.currentCard);
    //     }
    //     due = window.moment(Date.now());
    //     new Notice(t("CARD_PROGRESS_RESET"));
    //     this.currentDeck.nextCard(this);
    //     return due;
    // }

    // async burySiblingCards(tillNextDay: boolean): Promise<void> {
    //     if (tillNextDay) {
    //         this.plugin.data.buryList.push(cyrb53(this.currentCard.cardText));
    //         await this.plugin.savePluginData();
    //     }

    //     for (const sibling of this.currentCard.siblings) {
    //         const dueIdx = this.currentDeck.dueFlashcards.indexOf(sibling);
    //         const newIdx = this.currentDeck.newFlashcards.indexOf(sibling);

    //         if (dueIdx !== -1) {
    //             this.currentDeck.deleteFlashcardAtIndex(
    //                 dueIdx,
    //                 this.currentDeck.dueFlashcards[dueIdx].isDue
    //             );
    //         } else if (newIdx !== -1) {
    //             this.currentDeck.deleteFlashcardAtIndex(
    //                 newIdx,
    //                 this.currentDeck.newFlashcards[newIdx].isDue
    //             );
    //         }
    //     }
    // }

    parseLink(src: string) {
        const linkComponentsRegex =
            /^(?<file>[^#^]+)?(?:#(?!\^)(?<heading>.+)|#\^(?<blockId>.+)|#)?$/;
        const matched = typeof src === "string" && src.match(linkComponentsRegex);
        const file = matched.groups.file || this.currentCard.note.path;
        const target = this.plugin.app.metadataCache.getFirstLinkpathDest(
            file,
            this.currentCard.note.path
        );
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

    // async renderTransclude(
    //     el: HTMLElement,
    //     link: {
    //         text: string;
    //         file: string;
    //         heading: string;
    //         blockId: string;
    //         target: TFile;
    //     },
    //     recursiveDepth: number
    // ) {
    //     const cache = this.app.metadataCache.getCache(link.target.path);
    //     const text = await this.app.vault.cachedRead(link.target);
    //     let blockText;
    //     if (link.heading) {
    //         const clean = (s: string) => s.replace(/[\W\s]/g, "");
    //         const headingIndex = cache.headings?.findIndex(
    //             (h) => clean(h.heading) === clean(link.heading)
    //         );
    //         const heading = cache.headings[headingIndex];

    //         const startAt = heading.position.start.offset;
    //         const endAt =
    //             cache.headings.slice(headingIndex + 1).find((h) => h.level <= heading.level)
    //                 ?.position?.start?.offset || text.length;

    //         blockText = text.substring(startAt, endAt);
    //     } else if (link.blockId) {
    //         const block = cache.blocks[link.blockId];
    //         const startAt = block.position.start.offset;
    //         const endAt = block.position.end.offset;
    //         blockText = text.substring(startAt, endAt);
    //     } else {
    //         blockText = text;
    //     }

    //     this.renderMarkdownWrapper(blockText, el, recursiveDepth + 1);
    // }
}