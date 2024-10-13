import { CardType, ReviewResponse, schedule } from "src/scheduler/scheduling";
import { nanoid } from "nanoid";
import { FLAG, FlashcardMetadata, parseCardText, parseFileText, parseMetadata } from "src/data/parser";
import { moment, Notice } from "obsidian";
import { SchedulingMetadata } from "src/data/utils/TextGenerator";
import { plugin } from "src/main";
import { ParsedCard } from "src/data/models/parsedCard";
import { getAnnotationFilePath } from "src/data/models/sourceNote";
import { filePathsWithTag, getCurrentDateIsoString } from "src/data/disk";
import { calculateDelayBeforeReview } from "src/utils";

export abstract class AbstractFlashcard {
    answerText: string;
    cardType: number;
    context: string;
    dueDate: string;
    ease: number;
    id: string;
    interval: number;
    questionText: string;
    siblings: string[];
    // todo: rename
    parentId: string;
    flag: FLAG;
    parsedCardId: string;

    // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
    // probably should change this to be a union type
    protected constructor(cardType: CardType, parsedCardId: string, cardMetadata?: FlashcardMetadata, annotationId?: string) {
        this.id = nanoid(8);
        this.cardType = cardType;
        this.context = null;
        this.dueDate = cardMetadata?.dueDate;
        this.ease = cardMetadata?.ease;
        this.interval = cardMetadata?.interval;
        this.parentId = cardMetadata?.annotationId || annotationId;
        this.flag = cardMetadata?.flag;
        this.siblings = [];
        this.parsedCardId = parsedCardId;
    }

    isDue() {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        return this.dueDate === null || this.dueDate <= getCurrentDateIsoString();
    }
}

export class Flashcard extends AbstractFlashcard {
    // cardMetadata and highlight ID are mutually exclusive properties. Given that there is no constructor overloading
    // probably should change this to be a union type
    constructor(parsedCardId: string, questionText: string, answerText: string, cardMetadata?: FlashcardMetadata, annotationId?: string) {
        // todo: handle other types later
        const cardType = CardType.MultiLineBasic;
        if (cardMetadata) {
            super(cardType, parsedCardId, cardMetadata);
        } else {
            super(cardType, parsedCardId, null, annotationId);
        }
        this.questionText = questionText;
        this.answerText = answerText;
    }
}

// todo: rename to update card?
export function schedulingMetadataForResponse(
    clickedResponse: ReviewResponse,
    schedulingMetadata: SchedulingMetadata,
): SchedulingMetadata {
    // const flashcard = getFlashcardById(flashcardId);
    // take the response received
    // use that to update flashcard internal state
    // that will take care of writing to disk
    // so this should be a relatively lean method
    // don't forget to update siblings?
    let schedObj;
    // is new card
    if (schedulingMetadata.dueDate === null) {
        // todo: move default settings down into schedule()?
        schedObj = schedule(
            clickedResponse,
            1.0,
            plugin.data.settings.baseEase,
            0,
        );
    } else {
        schedObj = schedule(
            clickedResponse,
            schedulingMetadata.interval,
            schedulingMetadata.ease,
            calculateDelayBeforeReview(schedulingMetadata.dueDate),
        );
    }
    const {interval, ease} = schedObj;
    // todo: parameterize format? nah
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const due = moment(Date.now() + interval * 24 * 3600 * 1000).format("YYYY-MM-DD");
    return {interval, ease, dueDate: due};
}

export function maturityCounts(flashcards: Flashcard[]) {
    let newCount = 0, mature = 0, learning = 0;
    flashcards.forEach(t => {
        if (t.interval >= 32) {
            mature += 1;
        } else if (t.interval && t.interval < 32) {
            learning += 1;
        } else {
            // } if (!t.interval) {
            newCount += 1;
        }
    });
    return {mature, learning, new: newCount};
}

export function createFlashcard(parsedCard: ParsedCard, questionText: string, answerText: string) {
    return new Flashcard(parsedCard.id, questionText, answerText, parseMetadata(parsedCard.metadataText));
}

export function generateFlashcardsArray(parsedCardsArray: ParsedCard[]) {
    const out: Flashcard[] = [];
    for (const parsedCard of parsedCardsArray) {
        const [questionText, answerText] = parseCardText(parsedCard.cardText);
        out.push(createFlashcard(parsedCard, questionText, answerText));
    }
    return out;
}

export class FlashcardNote {
    path: string;
    flashcards: Flashcard[];
    parentPath: string;
    parsedCards: ParsedCard[];

    constructor(path: string) {
        this.path = path;
        this.flashcards = [];
        this.parentPath = "";
        this.parsedCards = [];
    }

    async initialize(flashcardIndex: FlashcardIndex) {
        this.parentPath = getAnnotationFilePath(this.path);
        this.parsedCards = await parseFileText(this.path);
        try {
            this.flashcards = generateFlashcardsArray(this.parsedCards);
            this.flashcards.forEach(t => flashcardIndex.flashcards.set(t.id, t));
        } catch (e) {
            console.error(e);
            throw new Error(e);
        }
        return this;
    }
}

export class FlashcardIndex {
    flashcardNotes: FlashcardNote[];
    flashcards: Map<string, Flashcard>;

    constructor() {
        this.flashcardNotes = [];
        this.flashcards = new Map<string, Flashcard>();
    }

    async initialize() {
        // todo: remove hardcoding of tag
        const filePaths = filePathsWithTag("flashcards");
        const notesWithFlashcards = filePaths.map((t: string) => new FlashcardNote(t));
        for (const t of notesWithFlashcards) {
            try {
                await t.initialize(this);
            } catch (e) {
                // WARNING! this is dangerous, I am catching other errors and just assuming that these are this error
                console.error(e);
                console.error(`init: unable to initialize book ${t.path}`);
                new Notice("Error: Unable to parse legacy SRS flashcards. Try removing the #flashcards tag from files with SRS flashcards.");
            }
        }
        this.flashcardNotes = notesWithFlashcards;
        console.log("Card Coverage: Flashcard index successfully initialized");
        return this;
    }

    addFlashcardNoteToIndex(flashcardNote: FlashcardNote) {
        if (this.flashcardNotes.find(t => t.path === flashcardNote.path)) {
            throw new Error(`addFlashcardNoteToIndex: ${flashcardNote.path} is already in the index`);
        }
        this.flashcardNotes.push(flashcardNote);
    }
}