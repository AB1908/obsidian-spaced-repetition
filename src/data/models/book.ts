import type { CachedMetadata, HeadingCache, SectionCache } from "obsidian";
import { nanoid } from "nanoid";
import { getAnnotationFilePath, getFileContents, getMetadataForFile, updateCardOnDisk } from "src/data/disk";
import { type annotation, parseAnnotations } from "src/data/models/annotations";
import { type Flashcard, generateFlashcardsArray, schedulingMetadataForResponse } from "src/data/models/flashcard";
import { parseFileText } from "src/data/parser";
import type { ParsedCard } from "src/data/models/parsedCard";
import { generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata } from "src/data/utils/TextGenerator";
import type { ReviewResponse } from "src/scheduler/scheduling";

export const ANNOTATIONS_YAML_KEY = "annotations";
export type RawBookSection = (SectionCache | HeadingCache);
export type BookMetadataSection = Heading | annotation;
export type BookMetadataSections = BookMetadataSection[];

// TODO: this is not really a "book" per se
export interface book {
    id: string;
    name: string;
    children: Heading[];
    counts: Count;
}

export interface Count {
    with: number;
    without: number;
}

export function isHeading(section: BookMetadataSection): section is Heading {
    return (section as Heading).level !== undefined;
}

export function isAnnotation(section: BookMetadataSection): section is annotation {
    return (section as annotation).highlight !== undefined;
}

export function bookSections(metadata: CachedMetadata | null | undefined, fileText: string, flashcards: Flashcard[]) {
    if (metadata == null) throw new Error("bookSections: metadata cannot be null/undefined");
    let output: (BookMetadataSection)[] = [];
    let headingIndex = 0;
    const fileTextArray = fileText.split("\n");
    const annotationsWithFlashcards = new Set(flashcards.map(t => t.annotationId));
    if (metadata.sections == null) throw new Error("bookSections: file has no sections");
    for (const cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            const annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line + 1).join("\n"));
            output.push({ hasFlashcards: annotationsWithFlashcards.has(annotation.id), ...annotation });
        } else if (cacheItem.type === "heading") {
            const headings = metadata?.headings;
            if (headings === undefined) throw new Error("bookSections: no headings in file");
            output.push(new Heading(headings[headingIndex]));
            headingIndex++;
        } else {
            // TODO: Any edge cases?
        }
    }
    output = generateHeaderCounts(output);
    return output;
}

export class Heading {
    id: string;
    level: number;
    name: string;
    children: Heading[];
    counts: Count;

    constructor(heading: HeadingCache) {
        // might be too clever
        ({ heading: this.name, level: this.level } = heading);
        this.id = nanoid(8);
        this.children = [];
        this.counts = { with: 0, without: 0 };
    }

}

// DONE rewrite to use ids instead of doing object equality
// DONE: fix types, narrowing doesn't work here somehow
export interface frontbook {
    id: string;
    name: string;
    flashcardsPath: string;
    parsedCards: ParsedCard[];
    flashcards: Flashcard[];
    annotationPath: string;
    bookSections: BookMetadataSections;
}

export function findPreviousHeader(section: RawBookSection | BookMetadataSection, sections: Array<typeof section>) {
    let index = sections.indexOf(section);
    // top level headers don't have a parent
    // done: consider changing this to -1 so we have a consistent return type
    if ("level" in section) {
        if (section.level == 1) return -1;
    }
    while (index >= 0) {
        const currentSection: typeof section = sections[index];
        if (section == currentSection) {
            // we are on the same item lol
            // decrement and continue
            index--;
            continue;
        }
        if ("level" in currentSection) { // we are on a heading
            // if same level heading than 100% it is not the right header
            // decrement and skip
            if (("level" in section) && (currentSection.level == section.level)) {
                index--;
                continue;
            }
        }
        if ("level" in currentSection)
            // we've finally reached a header
            // return it
            return index;
        index--;
    }
    return -1;
}

export function findNextHeader(section: RawBookSection | BookMetadataSection, sections: Array<typeof section>) {
    let index = sections.indexOf(section) + 1;
    // top level headers don't have a parent
    // TODO: consider changing this to -1 so we have a consistent return type
    // if (('level' in section) && ((section as HeadingCache).level == 1)) return null;
    while (index < sections.length) {
        const currentSection = sections[index];
        // if (section == sectionStart) {
        //     // we are on the same item lol
        //     // increment and continue
        //     index++;
        //     continue;
        // }
        if ("level" in currentSection) {
            if (currentSection.level <= (section as HeadingCache).level) {
                return index;
            }
        }
        index++;
    }
    return -1;
}

export function updateHeaders(cacheItem: annotation, sections: BookMetadataSections, key: keyof Count) {
    const previousHeadingIndex = findPreviousHeader(cacheItem, sections);
    let previousHeading = sections[previousHeadingIndex] as Heading;
    while (previousHeading != null) {
        previousHeading.counts[key]++;
        previousHeading = sections[findPreviousHeader(previousHeading, sections)] as Heading;
    }
}

export function generateHeaderCounts(sections: BookMetadataSections) {
    let i = 0;
    const out = sections;
    while (i < out.length) {
        const cacheItem = out[i];
        if (isHeading(cacheItem)) { /* empty */
        } else {
            if (cacheItem.hasFlashcards)
                updateHeaders(cacheItem, out, "with");
            else
                updateHeaders(cacheItem, out, "without");
        }
        i++;
    }
    return out;
}

export class Book implements frontbook {
    annotationPath: string;
    bookSections: (annotation | Heading)[];
    flashcards: Flashcard[];
    id: string;
    name: string;
    parsedCards: ParsedCard[];
    flashcardsPath: string;
    reviewIndex: number;
    reviewDeck: Flashcard[];

    constructor(path: string, name: string) {
        this.id = nanoid(8);
        this.flashcardsPath = path;
        this.name = name;
        this.parsedCards = [];
        this.flashcards = [];
        this.annotationPath = "";
        this.bookSections = [];
        this.reviewIndex = -1;
        this.reviewDeck = [];
    }

    async initialize() {
        this.parsedCards = await parseFileText(this.flashcardsPath);
        this.flashcards = generateFlashcardsArray(this.parsedCards);
        const annotationTFile = getAnnotationFilePath(this.flashcardsPath);
        if (annotationTFile) {
            this.annotationPath = annotationTFile.path;
            this.bookSections = bookSections(
                getMetadataForFile(annotationTFile.path),
                await getFileContents(annotationTFile.path),
                this.flashcards
            );
        }
        this.generateReviewDeck();
        return this;
    }

    // So regenerate the review deck, and then check if it has anything.
    canBeReviewed() {
        return this.reviewDeck.length != 0;
    }

    // Sometimes, we may have finished reviewing a deck. We shouldn't allow reviewing it again.

    annotations() {
        return this.bookSections.filter((t): t is annotation => isAnnotation(t));
    }

    startReviewing() {
        this.reviewIndex = 0;
    }

    isInReview() {
        return this.reviewIndex != -1;
    }

    getReviewCard(): Flashcard | null {
        if (!this.isInReview()) {
            new Error("Book is not in review");
        }
        if (this.reviewIndex >= this.reviewDeck.length) {
            return null;
        }
        return this.reviewDeck[this.reviewIndex];
    }

    nextReviewCard() {
        this.reviewIndex++;
        if (this.reviewIndex >= this.reviewDeck.length) {
            this.finishReviewing();
        }
    }

    finishReviewing() {
        this.reviewIndex = -1;
        this.reviewDeck = [];
    }

    // todo: think differently?
    async processCardReview(flashcardId: string, reviewResponse: ReviewResponse) {
        const card = this.flashcards.filter(t => t.id === flashcardId)[0];
        const updatedSchedulingMetadata = schedulingMetadataForResponse(reviewResponse, {
            interval: card.interval,
            ease: card.ease,
            dueDate: card.dueDate
        });
        await this.updateParsedCard(card, updatedSchedulingMetadata);
        this.updateFlashcard(flashcardId, updatedSchedulingMetadata);
    }

    private generateReviewDeck() {
        this.reviewDeck = this.flashcards.filter(t => t.isDue());
        this.shuffleReviewDeck();
    }

    // write to disk first
    // then updated parsed card index
    // though that state might go out of sync depending on how fast we call it
    // todo: debounce?

    // copied from https://stackoverflow.com/a/12646864/13285428
    private shuffleReviewDeck() {
        // can also use this, but it is an Obsidian extension to the Array prototype
        // this.reviewDeck.shuffle();
        for (let i = this.reviewDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [(this.reviewDeck)[i], (this.reviewDeck)[j]] = [(this.reviewDeck)[j], (this.reviewDeck)[i]];
        }
    }

    private updateFlashcard(flashcardId: string, updatedSchedulingMetadata: SchedulingMetadata) {
        this.flashcards.forEach((card: Flashcard, index: number) => {
            if (card.id == flashcardId) {
                this.flashcards[index].dueDate = updatedSchedulingMetadata.dueDate;
                this.flashcards[index].ease = updatedSchedulingMetadata.ease;
                this.flashcards[index].interval = updatedSchedulingMetadata.interval;
            }
        });
    }

    // todo: feels like disk update should be put somewhere else, like parsedcard should have its
    // own class
    private async updateParsedCard(card: Flashcard, updatedSchedulingMetadata: SchedulingMetadata) {
        const parsedCardCopy = this.parsedCards.filter((parsedCard: ParsedCard) => parsedCard.id === card.parsedCardId)[0];
        const originalCardAsStorageFormat = generateCardAsStorageFormat(parsedCardCopy);

        const updatedParsedCard = {
            ...parsedCardCopy, metadataText: metadataTextGenerator(
                card.annotationId,
                updatedSchedulingMetadata,
                card.flag
            )
        };
        const updatedCardAsStorageFormat = generateCardAsStorageFormat(updatedParsedCard);

        const writeSuccessful = await updateCardOnDisk(parsedCardCopy.notePath, originalCardAsStorageFormat, updatedCardAsStorageFormat);

        if (writeSuccessful) {
            this.parsedCards.forEach((value, index, array) => {
                if (value.id === parsedCardCopy.id) {
                    array[index] = updatedParsedCard;
                }
            });
        } else {
            //empty
        }
    }
}