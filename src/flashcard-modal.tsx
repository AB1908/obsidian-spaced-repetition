import React from "react";
import {
    App, Modal, Platform
} from "obsidian";
import { createRoot, Root } from "react-dom/client";

import type SRPlugin from "src/main";
import { Card } from "src/scheduling";
import { Deck } from "./Deck";
import { ModalElement } from "./ui/views/modal";

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
}