import {LEGACY_SCHEDULING_EXTRACTOR, MULTI_SCHEDULING_EXTRACTOR} from "src/constants";
import {Card, ReviewResponse, schedule} from "src/scheduling";
import {Deck, deleteFlashcardAtIndex} from "src/deck";
import {t} from "src/lang/helpers";
import {MarkdownView, Notice, WorkspaceLeaf} from "obsidian";
import {cyrb53} from "src/utils";
import {FlashcardModal} from "src/flashcard-modal";
import {SRSettings} from "src/settings";

export function extractFileMatches(src: string, currentNotePath: string) {
    const linkComponentsRegex = /^(?<file>[^#^]+)?(?:#(?!\^)(?<heading>.+)|#\^(?<blockId>.+)|#)?$/;
    const matched = typeof src === "string" && src.match(linkComponentsRegex);
    const file = matched.groups.file || currentNotePath;
    return {matched, file};
}

export function renderDecks(decks: Deck[], containerEl: HTMLElement, modal: FlashcardModal) {
    for (const deck of decks) {
        deck.render(containerEl, modal);
    }
}

export function createEditLaterButton(contentEl: HTMLElement, currentDeck: Deck, currentCard: Card, index: number) {
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
        currentDeck = deleteFlashcardAtIndex(index, this.currentCard.isDue, currentDeck);
        burySiblingCards(false, this.currentCard, currentDeck);
        currentDeck.nextCard(this, currentDeck);
    });
    return fileLinkView;
}

export function generateNewSchedulingText(sep: string, dueString: string, interval: number, ease: number, cardText: string, due: boolean, siblingIdx: number) {
    // check if we're adding scheduling information to the flashcard
    // for the first time
    if (cardText.lastIndexOf("<!--SR:") === -1) {
        cardText =
            cardText + sep + `<!--SR:!${dueString},${interval},${ease}-->`;
    } else {
        let scheduling: RegExpMatchArray[] = [
            ...cardText.matchAll(MULTI_SCHEDULING_EXTRACTOR),
        ];
        if (scheduling.length === 0) {
            scheduling = [...cardText.matchAll(LEGACY_SCHEDULING_EXTRACTOR)];
        }

        const currCardSched: string[] = ["0", dueString, interval.toString(), ease.toString()];
        if (due) {
            scheduling[siblingIdx] = currCardSched;
        } else {
            scheduling.push(currCardSched);
        }

        cardText = cardText.replace(/<!--SR:.+-->/gm, "");
        cardText += "<!--SR:";
        for (let i = 0; i < scheduling.length; i++) {
            cardText += `!${scheduling[i][1]},${scheduling[i][2]},${scheduling[i][3]}`;
        }
        cardText += "-->";
    }
    return cardText;
}

export function calculateSchedInfo(currentCard: Card, response: ReviewResponse.Easy | ReviewResponse.Good | ReviewResponse.Hard, pluginSettings: SRSettings, dueDatesFlashcards: Record<number, number>, easyByPath: Record<string, number>) {
    let schedObj: Record<string, number>;
    // scheduled card
    if (currentCard.isDue) {
        schedObj = schedule(
            response,
            currentCard.interval,
            currentCard.ease,
            currentCard.delayBeforeReview,
            pluginSettings,
            dueDatesFlashcards
        );
    } else {
        let initial_ease: number = pluginSettings.baseEase;
        if (
            Object.prototype.hasOwnProperty.call(
                easyByPath,
                currentCard.note.path
            )
        ) {
            initial_ease = Math.round(easyByPath[currentCard.note.path]);
        }

        schedObj = schedule(
            response,
            1.0,
            initial_ease,
            0,
            pluginSettings,
            dueDatesFlashcards
        );
    }

    const interval = schedObj.interval;
    const ease = schedObj.ease;
    const due = window.moment(Date.now() + interval * 24 * 3600 * 1000);
    return {interval, ease, due};
}

export function getCardTextSeparator(cardText: string, cardCommentOnSameLine: boolean) {
    let sep: string = cardCommentOnSameLine ? " " : "\n";
    // Override separator if last block is a codeblock
    if (cardText.endsWith("```") && sep !== "\n") {
        sep = "\n";
    }
    return sep;
}

export async function burySiblingCards(
    tillNextDay: boolean,
    currentCard1: Card,
    currentDeck1: Deck
): Promise<Deck> {
    if (tillNextDay) {
        this.plugin.data.buryList.push(cyrb53(currentCard1.cardText));
        await this.plugin.savePluginData();
    }

    for (const sibling of currentCard1.siblings) {
        const dueIdx = currentDeck1.dueFlashcards.indexOf(sibling);
        const newIdx = currentDeck1.newFlashcards.indexOf(sibling);

        if (dueIdx !== -1) {
            currentDeck1 = deleteFlashcardAtIndex(dueIdx, currentDeck1.dueFlashcards[dueIdx].isDue, currentDeck1);
        } else if (newIdx !== -1) {
            currentDeck1 = deleteFlashcardAtIndex(newIdx, currentDeck1.newFlashcards[newIdx].isDue, currentDeck1);
        }
    }
    return currentDeck1;
}

export function processCrammedCards(response: ReviewResponse, currentDeck: Deck, index: number, currentCard: Card): Deck {
    if (response == ReviewResponse.Easy) {
        currentDeck = deleteFlashcardAtIndex(index, currentCard.isDue, currentDeck);
    }
    return currentDeck;
}

export async function buryCardAndSiblings(currentDeck: Deck, index: number, currentCard: Card, shouldBurySiblings: boolean): Promise<Deck> {
    currentDeck = deleteFlashcardAtIndex(index, currentCard.isDue, currentDeck);
    if (shouldBurySiblings) {
        currentDeck = await burySiblingCards(true, currentCard, currentDeck);
    }
    return currentDeck;
}

export function resetCardProgress(currentCard: Card, currentDeck: Deck, ease: number): Deck {
    currentCard.interval = 1.0;
    currentCard.ease = ease;
    if (currentCard.isDue) {
        currentDeck.dueFlashcards.push(currentCard);
    } else {
        currentDeck.newFlashcards.push(currentCard);
    }
    // due = window.moment(Date.now());
    new Notice(t("CARD_PROGRESS_RESET"));
    return currentDeck;
}