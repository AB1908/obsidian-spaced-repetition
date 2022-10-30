import { Card, ReviewResponse, schedule, textInterval } from "src/scheduling";
import { COLLAPSE_ICON } from "src/constants";
import { Platform } from "obsidian";
import h from "vhtml";
import { FlashcardModal, FlashcardModalMode } from "src/flashcard-modal";

export class Deck {
    public deckName: string;
    public newFlashcards: Card[];
    public newFlashcardsCount = 0; // counts those in subdecks too
    public dueFlashcards: Card[];
    public dueFlashcardsCount = 0; // counts those in subdecks too
    public totalFlashcards = 0; // counts those in subdecks too
    public subdecks: Deck[];
    public parent: Deck | null;

    constructor(deckName: string, parent: Deck | null) {
        this.deckName = deckName;
        this.newFlashcards = [];
        this.newFlashcardsCount = 0;
        this.dueFlashcards = [];
        this.dueFlashcardsCount = 0;
        this.totalFlashcards = 0;
        this.subdecks = [];
        this.parent = parent;
    }

    createDeck(deckPath: string[]): void {
        if (deckPath.length === 0) {
            return;
        }

        const deckName: string = deckPath.shift();
        for (const deck of this.subdecks) {
            if (deckName === deck.deckName) {
                deck.createDeck(deckPath);
                return;
            }
        }

        const deck: Deck = new Deck(deckName, this);
        this.subdecks.push(deck);
        deck.createDeck(deckPath);
    }

    insertFlashcard(deckPath: string[], cardObj: Card): void {
        if (cardObj.isDue) {
            this.dueFlashcardsCount++;
        } else {
            this.newFlashcardsCount++;
        }
        this.totalFlashcards++;

        if (deckPath.length === 0) {
            if (cardObj.isDue) {
                this.dueFlashcards.push(cardObj);
            } else {
                this.newFlashcards.push(cardObj);
            }
            return;
        }

        const deckName: string = deckPath.shift();
        for (const deck of this.subdecks) {
            if (deckName === deck.deckName) {
                deck.insertFlashcard(deckPath, cardObj);
                return;
            }
        }
    }

    // count flashcards that have either been buried
    // or aren't due yet
    countFlashcard(deckPath: string[], n = 1): void {
        this.totalFlashcards += n;

        const deckName: string = deckPath.shift();
        for (const deck of this.subdecks) {
            if (deckName === deck.deckName) {
                deck.countFlashcard(deckPath, n);
                return;
            }
        }
    }

    deleteFlashcardAtIndex(index: number, cardIsDue: boolean): void {
        if (cardIsDue) {
            this.dueFlashcards.splice(index, 1);
            this.dueFlashcardsCount--;
        } else {
            this.newFlashcards.splice(index, 1);
            this.newFlashcardsCount--;
        }

        let deck: Deck = this.parent;
        while (deck !== null) {
            if (cardIsDue) {
                deck.dueFlashcardsCount--;
            } else {
                deck.newFlashcardsCount--;
            }
            deck = deck.parent;
        }
    }

    sortSubdecksList(): void {
        this.subdecks.sort((a, b) => {
            if (a.deckName < b.deckName) {
                return -1;
            } else if (a.deckName > b.deckName) {
                return 1;
            }
            return 0;
        });

        for (const deck of this.subdecks) {
            deck.sortSubdecksList();
        }
    }

    render(containerEl: HTMLElement, modal: FlashcardModal): void {
        const deckView: HTMLElement = containerEl.createDiv("tree-item");

        const deckViewSelf: HTMLElement = deckView.createDiv(
            "tree-item-self tag-pane-tag is-clickable"
        );
        let collapsed = true;
        let collapseIconEl: HTMLElement | null = null;
        if (this.subdecks.length > 0) {
            collapseIconEl = deckViewSelf.createDiv("tree-item-icon collapse-icon");
            collapseIconEl.innerHTML = COLLAPSE_ICON;
            (collapseIconEl.childNodes[0] as HTMLElement).style.transform = "rotate(-90deg)";
        }

        const deckViewInner: HTMLElement = deckViewSelf.createDiv("tree-item-inner");
        deckViewInner.addEventListener("click", () => {
            modal.plugin.data.historyDeck = this.deckName;
            modal.currentDeck = this;
            modal.checkDeck = this.parent;
            modal.setupCardsView();
            this.nextCard(modal, this);
        });
        const deckViewInnerText: HTMLElement = deckViewInner.createDiv("tag-pane-tag-text");
        deckViewInnerText.innerHTML += <span class="tag-pane-tag-self">{this.deckName}</span>;
        const deckViewOuter: HTMLElement = deckViewSelf.createDiv("tree-item-flair-outer");
        deckViewOuter.innerHTML += (
            <span>
                <span
                    style="background-color:#4caf50;"
                    class="tag-pane-tag-count tree-item-flair sr-deck-counts"
                >
                    {this.dueFlashcardsCount.toString()}
                </span>
                <span
                    style="background-color:#2196f3;"
                    class="tag-pane-tag-count tree-item-flair sr-deck-counts"
                >
                    {this.newFlashcardsCount.toString()}
                </span>
                <span
                    style="background-color:#ff7043;"
                    class="tag-pane-tag-count tree-item-flair sr-deck-counts"
                >
                    {this.totalFlashcards.toString()}
                </span>
            </span>
        );

        const deckViewChildren: HTMLElement = deckView.createDiv("tree-item-children");
        deckViewChildren.style.display = "none";
        if (this.subdecks.length > 0) {
            collapseIconEl.addEventListener("click", () => {
                if (collapsed) {
                    (collapseIconEl.childNodes[0] as HTMLElement).style.transform = "";
                    deckViewChildren.style.display = "block";
                } else {
                    (collapseIconEl.childNodes[0] as HTMLElement).style.transform =
                        "rotate(-90deg)";
                    deckViewChildren.style.display = "none";
                }
                collapsed = !collapsed;
            });
        }
        for (const deck of this.subdecks) {
            deck.render(deckViewChildren, modal);
        }
    }

    nextCard(modal: FlashcardModal, currentDeck: Deck): void {
        if (currentDeck.newFlashcards.length + currentDeck.dueFlashcards.length === 0) {
            if (currentDeck.dueFlashcardsCount + currentDeck.newFlashcardsCount > 0) {
                for (const deck of currentDeck.subdecks) {
                    if (deck.dueFlashcardsCount + deck.newFlashcardsCount > 0) {
                        modal.currentDeck = deck;
                        deck.nextCard(modal, this);
                        return;
                    }
                }
            }

            if (currentDeck.parent == modal.checkDeck) {
                modal.plugin.data.historyDeck = "";
                modal.decksList();
            } else {
                currentDeck.parent.nextCard(modal, this);
            }
            return;
        }

        modal.responseDiv.style.display = "none";
        modal.resetLinkView.style.display = "none";
        modal.titleEl.setText(
            `${currentDeck.deckName}: ${currentDeck.dueFlashcardsCount + currentDeck.newFlashcardsCount}`
        );

        modal.answerBtn.style.display = "initial";
        modal.flashcardView.innerHTML = "";
        modal.mode = FlashcardModalMode.Front;

        let interval = 1.0,
            ease: number = modal.plugin.data.settings.baseEase,
            delayBeforeReview = 0;
        if (currentDeck.dueFlashcards.length > 0) {
            if (modal.plugin.data.settings.randomizeCardOrder) {
                modal.currentCardIdx = Math.floor(Math.random() * currentDeck.dueFlashcards.length);
            } else {
                modal.currentCardIdx = 0;
            }
            modal.currentCard = currentDeck.dueFlashcards[modal.currentCardIdx];
            modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);

            interval = modal.currentCard.interval;
            ease = modal.currentCard.ease;
            delayBeforeReview = modal.currentCard.delayBeforeReview;
        } else if (currentDeck.newFlashcards.length > 0) {
            if (modal.plugin.data.settings.randomizeCardOrder) {
                const pickedCardIdx = Math.floor(Math.random() * currentDeck.newFlashcards.length);
                modal.currentCardIdx = pickedCardIdx;

                // look for first unscheduled sibling
                const pickedCard: Card = currentDeck.newFlashcards[pickedCardIdx];
                let idx = pickedCardIdx;
                while (idx >= 0 && pickedCard.siblings.includes(currentDeck.newFlashcards[idx])) {
                    if (!currentDeck.newFlashcards[idx].isDue) {
                        modal.currentCardIdx = idx;
                    }
                    idx--;
                }
            } else {
                modal.currentCardIdx = 0;
            }

            modal.currentCard = currentDeck.newFlashcards[modal.currentCardIdx];
            modal.renderMarkdownWrapper(modal.currentCard.front, modal.flashcardView);

            if (
                Object.prototype.hasOwnProperty.call(
                    modal.plugin.easeByPath,
                    modal.currentCard.note.path
                )
            ) {
                ease = modal.plugin.easeByPath[modal.currentCard.note.path];
            }
        }

        const hardInterval: number = schedule(
            ReviewResponse.Hard,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings
        ).interval;
        const goodInterval: number = schedule(
            ReviewResponse.Good,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings
        ).interval;
        const easyInterval: number = schedule(
            ReviewResponse.Easy,
            interval,
            ease,
            delayBeforeReview,
            modal.plugin.data.settings
        ).interval;

        if (modal.ignoreStats) {
            // Same for mobile/desktop
            modal.hardBtn.setText(`${modal.plugin.data.settings.flashcardHardText}`);
            modal.easyBtn.setText(`${modal.plugin.data.settings.flashcardEasyText}`);
        } else if (Platform.isMobile) {
            modal.hardBtn.setText(textInterval(hardInterval, true));
            modal.goodBtn.setText(textInterval(goodInterval, true));
            modal.easyBtn.setText(textInterval(easyInterval, true));
        } else {
            modal.hardBtn.setText(
                `${modal.plugin.data.settings.flashcardHardText} - ${textInterval(
                    hardInterval,
                    false
                )}`
            );
            modal.goodBtn.setText(
                `${modal.plugin.data.settings.flashcardGoodText} - ${textInterval(
                    goodInterval,
                    false
                )}`
            );
            modal.easyBtn.setText(
                `${modal.plugin.data.settings.flashcardEasyText} - ${textInterval(
                    easyInterval,
                    false
                )}`
            );
        }

        if (modal.plugin.data.settings.showContextInCards)
            modal.contextView.setText(modal.currentCard.context);
        if (modal.plugin.data.settings.showFileNameInFileLink)
            modal.fileLinkView.setText(modal.currentCard.note.basename);
    }
}
