//todo: investigate using lowdb
import {getFileContents, getMetadataForFile, updateCardOnDisk} from "src/data/import/disk";
import {annotation, parseAnnotations} from "src/data/import/annotations";
import {CachedMetadata, HeadingCache, SectionCache} from "obsidian";
import {nanoid} from "nanoid";
import {Flashcard, schedulingMetadataForResponse} from "src/data/models/flashcard";
import {parseFileText} from "src/data/parser";
import {ParsedCard} from "src/data/models/parsedCard";
import {generateFlashcardsArray} from "src/data/import/flashcards";
import {generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata} from "src/data/export/TextGenerator";
import {ReviewResponse} from "src/scheduler/scheduling";

// TODO: this is not really a "book" per se
export interface book {
    id:       string;
    name:     string;
    children: sectionTree[];
    counts:  Count;
}

export interface sectionTree {
    id:       string;
    name:     string;
    children: book[];
}

export interface Count {
    with:    number;
    without: number;
}

export function isHeading(section: BookMetadataSection): section is Heading {
    return (section as Heading).level !== undefined;
}

export function isAnnotation(section: BookMetadataSection): section is annotation {
    return (section as annotation).highlight !== undefined;
}

export function bookSections(metadata: CachedMetadata|null|undefined, fileText: string, flashcards: Flashcard[]) {
    if (metadata == null) throw new Error("bookSections: metadata cannot be null/undefined");
    const output: (BookMetadataSection)[] = [];
    const fileTextArray = fileText.split("\n");
    let headingIndex = 0;
    const annotationsWithFlashcards = new Set(flashcards.map(t=>t.annotationId));
    if (metadata.sections == null) throw new Error("bookSections: file has no sections");
    for (let cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            let annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line+1).join("\n"));
            output.push({hasFlashcards: annotationsWithFlashcards.has(annotation.id), ...annotation});
        } else if (cacheItem.type === "heading") {
            let headings = metadata?.headings;
            if (headings === undefined) throw new Error("bookSections: no headings in file");
            output.push(new Heading(headings[headingIndex]));
            headingIndex++;
        } else {
            // TODO: Any edge cases?
        }
    }
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
        ({heading: this.name, level: this.level} = heading);
        this.id = nanoid(8);
        this.children = [];
        this.counts = {with: 0, without: 0};
    }

}

export type BookMetadataSection = Heading | annotation;
export type BookMetadataSections = BookMetadataSection[];

// DONE rewrite to use ids instead of doing object equality
// DONE: fix types, narrowing doesn't work here somehow
export function getAnnotationsForSection(sectionId: string, bookSections: BookMetadataSections) {
    const index = bookSections.findIndex(t => t.id === sectionId);
    // todo: it feels like there should be a better way to do this
    const currentHeading = (bookSections[index] as Heading);
    let x = index + 1;
    while (x < bookSections.length) {
        const item = bookSections[x];
        // apparently, can't pass bookSections[x] in directly, see: https://stackoverflow.com/a/73666912
        if (isHeading(item)) {
            if (item.level <= currentHeading.level) {
                break;
            }
        }
        x++;
    }
    return bookSections.slice(index+1, x).filter(t => isAnnotation(t));
}

export interface frontbook {
    id:             string;
    name:           string;
    flashcardsPath:           string;
    parsedCards:    ParsedCard[];
    flashcards:     Flashcard[];
    annotationPath: string;
    bookSections: BookMetadataSections;
}

export interface BookCounts {
    mature:   number;
    new:      number;
    learning: number;
}

export const ANNOTATIONS_YAML_KEY = "annotations";

export function getAnnotationFilePath(path: string) {
    const metadata = getMetadataForFile(path);
    const annotationFromYaml = metadata?.frontmatter?.[ANNOTATIONS_YAML_KEY];
    if (!annotationFromYaml) return;
    const annotationLinkText = annotationFromYaml.replaceAll(/[\[\]]/g, "");
    return app.metadataCache.getFirstLinkpathDest(annotationLinkText, path);
}

function isHeadingCache(cacheItem: SectionCache|HeadingCache): cacheItem is HeadingCache {
    return (cacheItem as HeadingCache).level !== undefined;
}

export function findPreviousHeader(section: RawBookSection|BookMetadataSection, sections: Array<typeof section>) {
    let index = sections.indexOf(section);
    // top level headers don't have a parent
    // TODO: consider changing this to -1 so we have a consistent return type
    if (('level' in section) && ((section as HeadingCache).level == 1)) return null;
    while (start >= 0) {
        let sectionStart = sections[start];
        if (section == sectionStart) {
            // we are on the same item lol
            // decrement and continue
            start--;
            continue;
        }
        if (isHeadingCache(sectionStart)) {
            // if same level heading than 100% it is not the right header
            // decrement and skip
            if (sectionStart.level == (section as HeadingCache).level) {
                start--;
                continue;
            }
        }
        if (isHeadingCache(sectionStart))
            // we've finally reached a header
            // return it
            return start;
        start--;
    }
    return null;
}

export function findNextHeader(sections: (SectionCache | HeadingCache)[], section: HeadingCache) {
    let index = sections.indexOf(section) + 1;
    // top level headers don't have a parent
    // TODO: consider changing this to -1 so we have a consistent return type
    // if (('level' in section) && ((section as HeadingCache).level == 1)) return null;
    while (index < sections.length) {
        let currentSection = sections[index];
        // if (section == sectionStart) {
        //     // we are on the same item lol
        //     // increment and continue
        //     index++;
        //     continue;
        // }
        if (isHeadingCache(currentSection)) {
            if (currentSection.level <= (section as HeadingCache).level) {
                return index;
            }
        }
        index++;
    }
    return index;
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
    // const out = [...sections];
    const out = sections;
    // const out = sections;
    while (i < out.length) {
        let cacheItem = out[i];
        if (isHeading(cacheItem)) {
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
            this.bookSections = generateHeaderCounts(this.bookSections);
        }
        this.generateReviewDeck();
        return this;
    }

    private generateReviewDeck() {
        this.reviewDeck = this.flashcards.filter(t => t.isDue());
        this.shuffleReviewDeck();
    }

    // Sometimes, we may have finished reviewing a deck. We shouldn't allow reviewing it again.
    // So regenerate the review deck, and then check if it has anything.
    canBeReviewed() {
        return this.reviewDeck.length != 0;
    }

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

    // copied from https://stackoverflow.com/a/12646864/13285428
    private shuffleReviewDeck() {
        for (let i = this.reviewDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [(this.reviewDeck)[i], (this.reviewDeck)[j]] = [(this.reviewDeck)[j], (this.reviewDeck)[i]];
        }
    }

    // write to disk first
    // then updated parsed card index
    // though that state might go out of sync depending on how fast we call it
    // todo: debounce?
    // todo: think differently?
    async processCardReview(flashcardId: string, reviewResponse: ReviewResponse) {
        const card = this.flashcards.filter(t=>t.id === flashcardId)[0];
        const updatedSchedulingMetadata = schedulingMetadataForResponse(reviewResponse, {
            interval: card.interval,
            ease: card.ease,
            dueDate: card.dueDate
        });
        await this.updateParsedCard(card, updatedSchedulingMetadata);
        this.updateFlashcard(flashcardId, updatedSchedulingMetadata);
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

        }
    }
}