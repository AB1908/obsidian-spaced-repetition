import type { CachedMetadata, HeadingCache, SectionCache } from "obsidian";
import { nanoid } from "nanoid";
import {
    createFlashcardsFileForBook, deleteCardOnDisk,
    getFileContents,
    getMetadataForFile,
    getParentOrFilename,
    getTFileForPath,
    updateCardOnDisk
} from "src/data/disk";
import { type annotation, parseAnnotations } from "src/data/models/annotations";
import { Flashcard, FlashcardNote, schedulingMetadataForResponse } from "src/data/models/flashcard";
import type { ParsedCard } from "src/data/models/parsedCard";
import { generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata } from "src/data/utils/TextGenerator";
import type { ReviewResponse } from "src/scheduler/scheduling";
import { TFile } from "obsidian";
import type SRPlugin from "src/main";
import { paragraph } from "src/data/models/paragraphs";
import {addBlockIdToParagraph, isAnnotationOrParagraph, isParagraph} from "src/api";
import { plugin } from "src/main";
import {CardType} from "src/scheduler/scheduling";
import {createParsedCard} from "src/data/models/parsedCard";

export const ANNOTATIONS_YAML_KEY = "annotations";
export type RawBookSection = (SectionCache | HeadingCache);
export type BookMetadataSection = Heading | annotation | paragraph;
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

// todo: should this be part of the Book class??
export function bookSections(metadata: CachedMetadata | null | undefined, fileText: string, flashcards: Flashcard[]) {
    if (metadata == null) throw new Error("bookSections: metadata cannot be null/undefined");
    let output: BookMetadataSections = [];
    let headingIndex = 0;
    const fileTextArray = fileText.split("\n");
    const blocksWithFlashcards = new Set(flashcards.map(t => t.parentId));
    if (metadata.sections == null) throw new Error("bookSections: file has no sections");
    for (const cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            const annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line + 1).join("\n"));
            // todo: I think I've fucked up the ordering for assignment with spread
            let item = { hasFlashcards: blocksWithFlashcards.has(annotation.id), ...annotation };
            output.push(item);
            plugin.index.addToAnnotationIndex(item);
        } else if (cacheItem.type === "heading") {
            const headings = metadata?.headings;
            // todo: again, this is another case of an interesting type problem like in paragraphs.ts
            // todo: figure out a way to remove this error handling logic
            if (headings === undefined) throw new Error("bookSections: no headings in file");
            output.push(new Heading(headings[headingIndex]));
            headingIndex++;
        } else if (cacheItem.type == "paragraph") {
            // todo: test coverage
                const start = cacheItem.position.start.line;
                const end = cacheItem.position.end.line + 1;
                const paragraph = {
                    id: cacheItem.id || nanoid(8),
                    text: fileTextArray.slice(start,end).join("\n").replace(/\^.*$/g, ""),
                    wasIdPresent: cacheItem.id ? true : false,
                }
            let item = {
                ...paragraph,
                hasFlashcards: blocksWithFlashcards.has(paragraph.id), ...paragraph,
            };
            plugin.index.addToAnnotationIndex(item);
            output.push(item)
            // TODO: Any edge cases?
        }
    }
    // todo: use method chaining instead?
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
        // todo: convert to idiomatic type check?
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

export function updateHeaders(cacheItem: annotation | paragraph, sections: BookMetadataSections, key: keyof Count) {
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

// done: this isn't necessarily an abstraction over Obsidian APIs and contains business logic
// move to some other file instead
// done: how can the return type for this be undefined? WTF??
export function getAnnotationFilePath(path: string) {
    const metadata = getMetadataForFile(path);
    const annotationFromYaml = metadata?.frontmatter?.[ANNOTATIONS_YAML_KEY];
    if (!annotationFromYaml)
        throw new Error(`getAnnotationFilePath: ${path} does not have a valid parent`);
    const annotationLinkText = annotationFromYaml.replaceAll(/[[\]]/g, "");
    const destinationTFile = app.metadataCache.getFirstLinkpathDest(annotationLinkText, path);
    if (destinationTFile instanceof TFile) {
        return destinationTFile.path;
    } else {
        throw new Error(`getAnnotationFilePath: ${path} does not have a valid parent`);
    }
}

// DONE rewrite to use ids instead of doing object equality
// DONE: fix types, narrowing doesn't work here somehow
export interface frontbook {
    id: string;
    name: string;
    path: string;
    bookSections: BookMetadataSections;
}

//todo: split review related logic into separate class??
export class SourceNote implements frontbook {
    path: string;
    bookSections: BookMetadataSections;
    id: string;
    name: string;
    reviewIndex: number;
    tags: string[];
    // even though this is a subset of this.flashcards, we need this as we are maintaining this as
    // state internally and not passing it to the frontend
    // this is because it is easier to test here and also makes front end simpler in terms of
    // routes and state management
    // however, there may be better approaches
    reviewDeck: Flashcard[];
    // i feel like i need a factory method that creates a SourceNoteWithFLashcards
    // and a SourceNote
    flashcardNote: FlashcardNote;
    // todo: think of a way to not use plugin
    // the reason I need it is because to find the corresponding flashcard note
    plugin: SRPlugin;

    constructor(path: string, plugin: SRPlugin) {
        this.id = nanoid(8);
        this.name = "";
        this.path = path;
        this.bookSections = [];
        this.reviewIndex = -1;
        this.reviewDeck = [];
        this.plugin = plugin;
        this.flashcardNote = null;
        this.tags = [];
    }

    // first initialize all the basic attributes of the book/note
    // then initialize optional attributes like its flashcards
    // how do I find flashcards? err, well, using some kind of relationship?
    // basically need to do a join?
    // i imagine I might need to have parsed flashcards earlier?
    // if not, I need to find them while initializing the book and then get them up and running
    // seems somewhat slow to me
    // potentially investigate web workers in the future
    // booksections: this must necessarily come later because of its reliance on flashcards
    // think of decoupling that later down the line?

    async initialize() {
        // done: fix unnecessary annotation path extraction
        // const annotationTFile = getTFileForPath(this.path);
        this.flashcardNote = this.plugin.flashcardIndex.flashcardNotes.filter(t=>t.parentPath === this.path)[0];
        if (this.flashcardNote === null) {
            // throw new Error(`initialize: corresponding flashcard note for ${this.path} could not be found`);
        }
        this.bookSections = bookSections(
            getMetadataForFile(this.path),
            await getFileContents(this.path),
            this.flashcardNote?.flashcards || []
        );

        this.name = getParentOrFilename(this.path);

        if (this.plugin.fileTagsMap.has(this.path)) {
            // @ts-ignore
            this.tags = this.plugin.fileTagsMap.get(this.path);
        } else {
            throw new Error(`sourceNoteInitialize: ${this.path} does not have tags`)
        }

        // done: join on parsed flashcards
        // do i need a global flashcards array?
        // it does align with my roadmap of allowing tag based grouping as I would need a global index there as well
        // plugin does not exist here, what to do?
        this.generateReviewDeck();
        return this;
    }

    canBeReviewed() {
        return this.reviewDeck.length != 0;
    }

    annotations() {
        return this.bookSections.filter((t): t is (annotation|paragraph) => isAnnotationOrParagraph(t));
    }

    annotationCoverage() {
        const annotationsWithFlashcards = new Set(this.flashcardNote.flashcards.map(t => t.parentId));
        const annotationsWithoutFlashcards = new Set<string>();
        for (const annotation of this.annotations()) {
            if (!annotationsWithFlashcards.has(annotation.id)) {
                annotationsWithoutFlashcards.add(annotation.id);
            }
        }
        return {annotationsWithFlashcards, annotationsWithoutFlashcards};
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

    // write to disk first
    // then updated parsed card index
    // though that state might go out of sync depending on how fast we call it
    // todo: debounce?
    // todo: think differently?
    async processCardReview(flashcardId: string, reviewResponse: ReviewResponse) {
        const card = this.flashcardNote.flashcards.filter(t => t.id === flashcardId)[0];
        const updatedSchedulingMetadata = schedulingMetadataForResponse(reviewResponse, {
            interval: card.interval,
            ease: card.ease,
            dueDate: card.dueDate
        });
        await this.updateParsedCard(card, updatedSchedulingMetadata);
        this.updateFlashcard(flashcardId, updatedSchedulingMetadata);
    }

    // Sometimes, we may have finished reviewing a deck. We shouldn't allow reviewing it again.
    // So regenerate the review deck, and then check if it has anything.
    private generateReviewDeck() {
        this.reviewDeck = this.flashcardNote?.flashcards.filter(t => t.isDue()) || [];
        this.shuffleReviewDeck();
    }

    // copied from https://stackoverflow.com/a/12646864/13285428
    // can also use Array.prototype.shuffle(), but it is an Obsidian extension to the
    // Array prototype and makes testing difficult as I'd have to do some sort of
    // patching to use the Obsidian Array prototype in my tests
    private shuffleReviewDeck() {
        for (let i = this.reviewDeck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [(this.reviewDeck)[i], (this.reviewDeck)[j]] = [(this.reviewDeck)[j], (this.reviewDeck)[i]];
        }
    }

// DONE: add logic to update in storage
    async createFlashcard(annotationId: string, question: string, answer: string, cardType: CardType.MultiLineBasic) {
        // done: Fix hardcoded path, should come from deckNote obj
        // TODO: error handling
        // need to check if block is a paragraph or an annotation
        const block = this.bookSections.filter(t => t.id === annotationId)[0];
        // I feel like this should be abstracted away into the class for a source note with paragraph
        if (isParagraph(block) && !block.wasIdPresent) {
            const text = addBlockIdToParagraph(block);
            await updateCardOnDisk(this.path, block.text, text);
        }
        const parsedCard: ParsedCard = await createParsedCard(question, answer, cardType, this.flashcardNote.path, annotationId);
        this.flashcardNote.parsedCards.push(parsedCard);
        const card = new Flashcard(parsedCard.id, question, answer, undefined, annotationId);
        this.flashcardNote.flashcards.push(card);
    }

    private updateFlashcard(flashcardId: string, updatedSchedulingMetadata: SchedulingMetadata) {
        this.flashcardNote.flashcards.forEach((card: Flashcard, index: number) => {
            if (card.id == flashcardId) {
                this.flashcardNote.flashcards[index].dueDate = updatedSchedulingMetadata.dueDate;
                this.flashcardNote.flashcards[index].ease = updatedSchedulingMetadata.ease;
                this.flashcardNote.flashcards[index].interval = updatedSchedulingMetadata.interval;
            }
        });
    }

    // todo: feels like disk update should be put somewhere else, like parsedcard should have its
    // own class
    private async updateParsedCard(card: Flashcard, updatedSchedulingMetadata: SchedulingMetadata) {
        const parsedCardCopy = this.flashcardNote.parsedCards.filter((parsedCard: ParsedCard) => parsedCard.id === card.parsedCardId)[0];
        const originalCardAsStorageFormat = generateCardAsStorageFormat(parsedCardCopy);

        const updatedParsedCard = {
            ...parsedCardCopy, metadataText: metadataTextGenerator(
                card.parentId,
                updatedSchedulingMetadata,
                card.flag
            )
        };
        const updatedCardAsStorageFormat = generateCardAsStorageFormat(updatedParsedCard);

        const writeSuccessful = await updateCardOnDisk(parsedCardCopy.notePath, originalCardAsStorageFormat, updatedCardAsStorageFormat);

        if (writeSuccessful) {
            this.flashcardNote.parsedCards.forEach((value, index, array) => {
                if (value.id === parsedCardCopy.id) {
                    array[index] = updatedParsedCard;
                }
            });
        } else {
            //empty
        }
    }

    async createFlashcardNote() {
        const {filename, path} = generateFlashcardsFileNameAndPath(this.path);
        await createFlashcardsFileForBook(this.path, path);
        this.flashcardNote = await new FlashcardNote(path);
        // WARN: this seems hacky, should I create another method?
        this.flashcardNote.parentPath = this.path;
    }
}

export class SourceNoteIndex {
    sourceNotes: SourceNote[]

    constructor() {
        this.sourceNotes = [];
    }

    async initialize(plugin: SRPlugin) {
        // iterate over tags in plugin
        // create set from tags in note
        // check membership of tag
        const tagsInSettings = ["review/note", "review/book"];
        const pathsWithAllowedTags  = new Set<string>();
        for (let [path, tags] of plugin.fileTagsMap) {
            const tagSet = new Set(tags);
            for (let tag of tagsInSettings) {
                if (tagSet.has(tag)) {
                    pathsWithAllowedTags.add(path);
                    break;
                }
            }
        }
        //todo: parameterize
        // const filePaths = filePathsWithTag("review/note");
        const notesWithAnnotations = Array.from(pathsWithAllowedTags.keys()).map((t: string) => new SourceNote(t, plugin));
        for (const t of notesWithAnnotations) {
            try {
                await t.initialize();
            } catch (e) {
                // WARNING! this is dangerous, I am catching other errors and just assuming that
                // these are this error
                console.error(e);
                console.error(`init: unable to initialize source note ${t.path}`);
            }
        }
        this.sourceNotes = notesWithAnnotations;
        console.log("Card Coverage: Source note index successfully initialized");
        return this;
    }

    getBook(bookId: string) {
        const book = this.sourceNotes.filter(t => t.id === bookId)[0];
        if (!book) {
            throw new Error(`No book found for id ${bookId}`);
        }
        return book;
    }

    getSourcesForReview() {
        return this.sourceNotes.filter(t=>t.flashcardNote);
    }

    getSourcesWithoutFlashcards(): SourceNote[] {
        return this.sourceNotes.filter(t => !t.flashcardNote);
    }
}

export function generateFlashcardsFileNameAndPath(bookPath: string) {
    const tfile = getTFileForPath(bookPath);
    let filename, parentPath;
    // example of path at root level:
    // "Folder 1/File.md": parent is "Folder 1"
    // "Test.md": parent is "/"
    // I need to generate "/Test - Flashcards.md" or "Folder 1/Flashcards.md"
    if (tfile.parent.name) { // tfile has its own folder, reuse the folder
        filename = "Flashcards.md";
        parentPath = `${tfile.parent.path}`;
    } else { // the tfile is at the root level, use original filename
        filename = `${tfile.basename} - Flashcards.md`;
        parentPath = ``;
    }
    const path = `${parentPath}/${filename}`
    return {filename, path};
}