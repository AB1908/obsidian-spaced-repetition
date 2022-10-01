import React from "react";
import {
    App, Modal, Platform
} from "obsidian";
import { createRoot, Root } from "react-dom/client";

import type SRPlugin from "src/main";
import { Card } from "src/scheduling";
import { Deck } from "./Deck";
import { ModalElement } from "./ui/modal";

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
    private modalElReactRoot: Root;

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
        this.modalElReactRoot = createRoot(this.modalEl)
        this.modalElReactRoot.render(
            <>
                <ModalElement
                    handleCloseButtonClick={() => this.close()}
                    additionalProps={
                        {
                            pluginData: this.plugin.data,
                            dueDatesFlashcards: this.plugin.dueDatesFlashcards,
                            easeByPath: this.plugin.easeByPath
                        }
                    }
                />
            </>
        )
    }

    onClose(): void {
        this.modalElReactRoot.unmount();
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
    // }


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

    // parseLink(src: string) {
    //     const linkComponentsRegex =
    //         /^(?<file>[^#^]+)?(?:#(?!\^)(?<heading>.+)|#\^(?<blockId>.+)|#)?$/;
    //     const matched = typeof src === "string" && src.match(linkComponentsRegex);
    //     const file = matched.groups.file || this.currentCard.note.path;
    //     const target = this.plugin.app.metadataCache.getFirstLinkpathDest(
    //         file,
    //         this.currentCard.note.path
    //     );
    //     // move lookup upstream? ^^^
    //     return {
    //         text: matched[0],
    //         file: matched.groups.file,
    //         heading: matched.groups.heading,
    //         blockId: matched.groups.blockId,
    //         target: target,
    //     };
    // }

    // embedMediaFile(el: HTMLElement, target: TFile) {
    //     el.innerText = "";
    //     if (IMAGE_FORMATS.includes(target.extension)) {
    //         el.createEl(
    //             "img",
    //             {
    //                 attr: {
    //                     src: this.plugin.app.vault.getResourcePath(target),
    //                 },
    //             },
    //             (img) => {
    //                 if (el.hasAttribute("width"))
    //                     img.setAttribute("width", el.getAttribute("width"));
    //                 else img.setAttribute("width", "100%");
    //                 if (el.hasAttribute("alt")) img.setAttribute("alt", el.getAttribute("alt"));
    //                 el.addEventListener(
    //                     "click",
    //                     (ev) =>
    //                     ((ev.target as HTMLElement).style.minWidth =
    //                         (ev.target as HTMLElement).style.minWidth === "100%"
    //                             ? null
    //                             : "100%")
    //                 );
    //             }
    //         );
    //         el.addClasses(["image-embed", "is-loaded"]);
    //     } else if (
    //         AUDIO_FORMATS.includes(target.extension) ||
    //         VIDEO_FORMATS.includes(target.extension)
    //     ) {
    //         el.createEl(
    //             AUDIO_FORMATS.includes(target.extension) ? "audio" : "video",
    //             {
    //                 attr: {
    //                     controls: "",
    //                     src: this.plugin.app.vault.getResourcePath(target),
    //                 },
    //             },
    //             (audio) => {
    //                 if (el.hasAttribute("alt")) audio.setAttribute("alt", el.getAttribute("alt"));
    //             }
    //         );
    //         el.addClasses(["media-embed", "is-loaded"]);
    //     } else {
    //         el.innerText = target.path;
    //     }
    // }

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