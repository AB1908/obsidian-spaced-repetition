//todo: investigate using lowdb
import {getFileContents, getMetadataForFile} from "src/data/import/disk";
import {annotation, parseAnnotations} from "src/data/import/annotations";
import {CachedMetadata, HeadingCache, SectionCache} from "obsidian";
import {nanoid} from "nanoid";
import {Flashcard} from "src/data/models/flashcard";
import {FlashCount} from "src/routes/notes-home-page";
import {parseFileText} from "src/data/parser";
import {ParsedCard} from "src/data/models/parsedCard";
import {generateFlashcardsArray} from "src/data/import/flashcards";

// TODO: this is not really a "book" per se
export interface book {
    id:       string;
    name:     string;
    children: book[];
    counts?:  Count;
}

export interface Counts {
    flashcards: FlashCount;
    sections: Record<string, Count>
}

export interface Count {
    with:    number;
    without: number;
}

export function isHeading(section: annotation|Heading): section is Heading {
    return (section as Heading).level !== undefined;
}

export function isAnnotation(section: annotation|Heading): section is annotation {
    return (section as annotation).highlight !== undefined;
}

export function bookSections(metadata: CachedMetadata, fileText: string, flashcards: Flashcard[]) {
    const output: (annotation|Heading)[] = [];
    const fileTextArray = fileText.split("\n");
    let headingIndex = 0;
    const annotationsWithFlashcards = new Set(flashcards.map(t=>t.annotationId));
    for (let cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            let annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line+1).join("\n"));
            output.push({hasFlashcards: annotationsWithFlashcards.has(annotation.id), ...annotation});
        } else if (cacheItem.type === "heading") {
            //done: fix casting
            output.push(new Heading(metadata.headings[headingIndex]));
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
    count?: Count;

    constructor(heading: HeadingCache) {
        // might be too clever
        ({heading: this.name, level: this.level} = heading);
        this.id = nanoid(8);
        this.children = [];
    }

}

export type BookMetadataSections = (Heading | annotation)[];

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
    // annotations: annotation[];
    bookSections: (annotation|Heading)[];
    // counts: BookCounts;
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
    const annotationTFile = app.metadataCache.getFirstLinkpathDest(annotationLinkText, path);
    return annotationTFile;
}

function isHeadingCache(cacheItem: SectionCache|HeadingCache): cacheItem is HeadingCache {
    return (cacheItem as HeadingCache).level !== undefined;
}

export function findPreviousHeader(sections: (SectionCache | HeadingCache)[], section: SectionCache | HeadingCache) {
    let start = sections.indexOf(section);
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

export function updateHeaders(cacheItem: annotation, sections: (annotation|Heading)[], key: keyof Count) {
    const previousHeadingIndex = findPreviousHeader(sections, cacheItem);
    let previousHeading = sections[previousHeadingIndex] as Heading;
    while (previousHeading != null) {
        previousHeading.count[key]++;
        previousHeading = sections[findPreviousHeader(sections, previousHeading)] as Heading;
    }
}

export function generateHeaderCounts(sections: (annotation|Heading)[]) {
    let i = 0;
    // const out = [...sections];
    const out = sections;
    // const out = sections;
    while (i < out.length) {
        let cacheItem = out[i];
        if (isHeading(cacheItem)) {
            cacheItem.count = { "with": 0, "without": 0 };
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
        this.annotationPath = null;
        this.bookSections = [];
        this.reviewIndex = -1;
        this.reviewDeck = null;
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
        this.reviewDeck = this.flashcards.filter(t => t.isDue());
        this.shuffleReviewDeck();
        return this;
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

    getNextFlashcard() {
        if (this.reviewIndex >= this.reviewDeck.length) {
            this.finishReviewing();
            return null;
        }
        return this.reviewDeck[this.reviewIndex++];
    }

    finishReviewing() {
        this.reviewIndex = -1;
    }

    // copied from https://stackoverflow.com/a/12646864/13285428
    private shuffleReviewDeck() {
        for (let i = this.reviewDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [(this.reviewDeck)[i], (this.reviewDeck)[j]] = [(this.reviewDeck)[j], (this.reviewDeck)[i]];
        }
    }
}