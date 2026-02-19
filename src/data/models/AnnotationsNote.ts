import type { CachedMetadata, HeadingCache, SectionCache } from "obsidian";
import { nanoid } from "nanoid";
import {
    createFlashcardsFileForBook, generateFlashcardsFileNameAndPath, getFileContents,
    getMetadataForFile,
    updateCardOnDisk, getTFileForPath, updateFrontmatter
} from "src/infrastructure/disk";
import { type annotation, parseAnnotations } from "src/data/models/annotations";
import { Flashcard, FlashcardNote, schedulingMetadataForResponse, maturityCounts } from "src/data/models/flashcard";
import type { ParsedCard } from "src/data/models/parsedCard";
import { generateCardAsStorageFormat, metadataTextGenerator, SchedulingMetadata } from "src/data/utils/TextGenerator";
import type { ReviewResponse } from "src/types/CardType";
import { paragraph, addBlockIdToParagraph } from "src/data/models/paragraphs";
import { CardType } from "src/types/CardType";
import {parseMetadata} from "src/data/parser";
import { AnnotationsNoteDependencies } from "src/data/utils/dependencies";
import { generateMarkdownWithHeaders } from "src/data/utils/annotationGenerator";
import { generateFingerprint, hasContentDrifted } from "src/data/utils/fingerprint";
import { extractParagraphFromSection } from "src/data/utils/sectionExtractor";
import { getSourceType, selectEligibleSourcePaths } from "src/data/source-discovery";
import { ISourceStrategy } from "./ISourceStrategy";
import { MarkdownSourceStrategy } from "./strategies/MarkdownSourceStrategy";
import { MoonReaderStrategy } from "./strategies/MoonReaderStrategy";
import {
    SourceCapabilities,
    getSourceCapabilities as buildSourceCapabilities,
} from "./sourceCapabilities";


export const ANNOTATIONS_YAML_KEY = "annotations";
export type RawBookSection = (SectionCache | HeadingCache);
export type BookMetadataSection = Heading | annotation | paragraph;
export type BookMetadataSections = BookMetadataSection[];

export interface BookFrontmatter {
    id: string; // The ID of the AnnotationsNote object (nanoid generated)
    path: string; // Path to the .mrexpt file
    annotationsPath: string; // Path to the Annotations.md file
    title: string;
    author: string;
    lastExportedTimestamp: number;
    lastExportedID: number;
    tags: string[];
}

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
    return section.type === 'heading';
}

export function isChapter(section: BookMetadataSection): section is Heading {
    return section.type === 'heading' && section.level === 1;
}

export function isAnnotation(section: BookMetadataSection): section is annotation {
    return section.type === 'annotation';
}

export function isParagraph(section: BookMetadataSection): section is paragraph {
    return section.type === 'paragraph';
}

export function isAnnotationOrParagraph(section: BookMetadataSection): section is (annotation|paragraph) {
    return section.type === 'annotation' || section.type === 'paragraph';
}

function transform(p: paragraph|annotation): annotation {
    if (isAnnotation(p)) {
        return p;
    } else {
        return {
            type: 'annotation',
            id: p.id,
            calloutType: "",
            note: "",
            highlight: p.text,
            hasFlashcards: p.hasFlashcards
        };
    }
}

// todo: should this be part of the Book class??
export function bookSections(metadata: CachedMetadata | null | undefined, fileText: string, flashcards: Flashcard[], plugin: AnnotationsNoteDependencies) {
    if (metadata == null) throw new Error("bookSections: metadata cannot be null/undefined");
    let output: BookMetadataSections = [];
    let headingIndex = 0;
    const fileTextArray = fileText.split("\n");
    const blocksWithFlashcards = new Set(flashcards.map(t => t.parentId));
    if (metadata.sections == null) throw new Error("bookSections: file has no sections");
    for (const cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            try {
                const annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line + 1).join("\n"));
                // todo: I think I've fucked up the ordering for assignment with spread
                let item = { ...annotation, hasFlashcards: blocksWithFlashcards.has(annotation.id) };
                output.push(item);
                plugin.index.addToAnnotationIndex(item);
            } catch (e) {
                console.warn(`bookSections: skipping non-annotation callout at line ${cacheItem.position.start.line}: ${e.message}`);
            }
        } else if (cacheItem.type === "heading") {
            const headings = metadata?.headings;
            // todo: again, this is another case of an interesting type problem like in paragraphs.ts
            // todo: figure out a way to remove this error handling logic
            if (headings === undefined) throw new Error("bookSections: no headings in file");
            output.push(new Heading(headings[headingIndex]));
            headingIndex++;
        } else if (cacheItem.type == "paragraph") {
                const extracted = extractParagraphFromSection(cacheItem, fileTextArray);
                const paragraph = {
                    type: 'paragraph' as const,
                    ...extracted,
                    fingerprint: generateFingerprint(extracted.text),
                }
            let item = {
                ...paragraph,
                hasFlashcards: blocksWithFlashcards.has(paragraph.id),
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
    readonly type = 'heading' as const;
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

export function findPreviousHeaderForSection(section: annotation|paragraph, sections: (RawBookSection|BookMetadataSection)[]) {
    let index = sections.indexOf(section);
    while (index >= 0) {
        const currentSection: (RawBookSection|BookMetadataSection) = sections[index];
        if (section == currentSection) {
            // we are on the same item lol
            // decrement and continue
            index--;
            continue;
        }
        if ("level" in currentSection)
            return index;
        index--;
    }
    return -1;
}

export function findPreviousHeaderForHeading(section: Heading, sections: (RawBookSection|BookMetadataSection)[]) {
    let index = sections.indexOf(section);
    const sectionIsHeading = "level" in section;
    // top level headers don't have a parent
    if (sectionIsHeading && section.level == 1) return -1;
    while (index >= 0) {
        const currentSection: (RawBookSection|BookMetadataSection) = sections[index];
        if (section == currentSection) {
            index--;
            continue;
        }
        if ("level" in currentSection) {
            if (sectionIsHeading && currentSection.level == section.level) {
                index--;
                continue;
            }
            if (sectionIsHeading && currentSection.level + 1 == section.level)
                return index;
            else if (!sectionIsHeading)
                return index;
        }
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
    const previousHeadingIndex = findPreviousHeaderForSection(cacheItem, sections);
    let previousHeading = sections[previousHeadingIndex] as Heading;
    while (previousHeading != null) {
        previousHeading.counts[key]++;
        previousHeading = sections[findPreviousHeaderForHeading(previousHeading, sections)] as Heading;
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

import { renderAnnotation } from "../utils/annotationGenerator";

// DONE rewrite to use ids instead of doing object equality
// DONE: fix types, narrowing doesn't work here somehow
export interface frontbook {
    id: string;
    name: string;
    path: string;
    bookSections: BookMetadataSections;
}

//todo: split review related logic into separate class??
export class AnnotationsNote implements frontbook {
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
    // todo: reviewDeck may need to be its own class as review states will be important for implementing navigation
    reviewDeck: Flashcard[];
    // i feel like i need a factory method that creates a AnnotationsNoteWithFLashcards
    // and a AnnotationsNote
    flashcardNote: FlashcardNote | null;
    strategy: ISourceStrategy;
    // todo: think of a way to not use plugin
    // the reason I need it is because to find the corresponding flashcard note
    plugin: AnnotationsNoteDependencies;

    constructor(path: string, plugin: AnnotationsNoteDependencies) {
        this.id = nanoid(8);
        this.name = "";
        this.path = path;
        this.bookSections = [];
        this.reviewIndex = -1;
        this.reviewDeck = [];
        this.plugin = plugin;
        this.flashcardNote = null;
        this.tags = [];
        this.strategy = new MarkdownSourceStrategy(path);
    }

    updatePath(newPath: string) {
        this.path = newPath;
        this.name = getTFileForPath(newPath).basename;
        const bookFrontmatter = this.getBookFrontmatter();
        if (bookFrontmatter?.title) {
            this.name = bookFrontmatter.title;
        }
        this.strategy = this.resolveStrategy();
    }

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
            this.flashcardNote?.flashcards || [],
            this.plugin
        );

        this.detectDrift();

        this.name = getTFileForPath(this.path).basename;
        const bookFrontmatter = this.getBookFrontmatter();
        if (bookFrontmatter?.title) {
            this.name = bookFrontmatter.title;
        }

        if (this.plugin.fileTagsMap.has(this.path)) {
            // @ts-ignore
            this.tags = this.plugin.fileTagsMap.get(this.path);
        } else {
            throw new Error(`sourceNoteInitialize: ${this.path} does not have tags`)
        }

        this.strategy = this.resolveStrategy();

        // done: join on parsed flashcards
        // do i need a global flashcards array?
        // it does align with my roadmap of allowing tag based grouping as I would need a global index there as well
        // plugin does not exist here, what to do?
        this.generateReviewDeck();
        return this;
    }

    getNavigableSections(): Heading[] {
        return this.strategy.getNavigableSections(this.bookSections);
    }

    getSourceType() {
        return getSourceType(this.tags, !!this.getBookFrontmatter());
    }

    requiresSourceMutationConfirmation(): boolean {
        return this.getSourceType() === "direct-markdown";
    }

    getSourceCapabilities(): SourceCapabilities {
        return buildSourceCapabilities(
            this.getSourceType(),
            this.requiresSourceMutationConfirmation()
        );
    }

    private resolveStrategy(): ISourceStrategy {
        const sourceType = getSourceType(this.tags, !!this.getBookFrontmatter());
        return sourceType === "moonreader"
            ? new MoonReaderStrategy(this.path)
            : new MarkdownSourceStrategy(this.path);
    }

    private detectDrift() {
        if (!this.flashcardNote) return;
        for (const section of this.bookSections) {
            if (!isParagraph(section) || !section.hasFlashcards) continue;
            const linkedCards = this.flashcardNote.flashcards.filter(f => f.parentId === section.id);
            for (const card of linkedCards) {
                if (card.fingerprint && hasContentDrifted(card.fingerprint, section.text)) {
                    section.drifted = true;
                    break;
                }
            }
        }
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

    getProcessedAnnotations(sectionId?: string) {
        let sectionIndex = 0;
        let nextHeadingIndex = this.bookSections.length;

        if (sectionId) {
            sectionIndex = this.bookSections.findIndex(t => sectionId === t.id);
            // handle not found?
            if (sectionIndex === -1) return []; // or throw
            const selectedSection = this.bookSections[sectionIndex];
            // check if it's a heading?
            if (!isHeading(selectedSection)) return []; // matches current api logic

            const foundNext = findNextHeader(selectedSection, this.bookSections);
            if (foundNext !== -1) nextHeadingIndex = foundNext;
        }

        const annotations = this.bookSections
            .slice(sectionIndex, nextHeadingIndex)
            .filter((t): t is (annotation | paragraph) => isAnnotationOrParagraph(t));

        const flashcardCountForAnnotation: Record<string, number> = {};
        // todo: not every source note has a flashcard note
        if (this.flashcardNote) {
            for (const id of this.flashcardNote.flashcards.map(t => t.parentId)) {
                flashcardCountForAnnotation[id] = (flashcardCountForAnnotation[id] || 0) + 1;
            }
        }

        return annotations.map(t => {
            return {
                ...transform(t),
                flashcardCount: flashcardCountForAnnotation[t.id] || 0
            };
        }).filter(t => !t.deleted);
    }

    getAnnotation(annotationId: string): annotation {
        const match = this.annotations().find(t => t.id === annotationId);
        if (!match) throw new Error(`Annotation not found: ${annotationId}`);
        return transform(match);
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
        this.generateReviewDeck();
    }

    // write to disk first
    // then updated parsed card index
    // though that state might go out of sync depending on how fast we call it
    // todo: debounce?
    // todo: think differently?
    async processCardReview(flashcardId: string, reviewResponse: ReviewResponse) {
        const card = this.flashcardNote.flashcards.find(t => t.id === flashcardId);
        if (!card) throw new Error(`processCardReview: card ${flashcardId} not found`);
        
        const updatedSchedulingMetadata = schedulingMetadataForResponse(reviewResponse, {
            interval: card.interval,
            ease: card.ease,
            dueDate: card.dueDate
        });
        await this.flashcardNote.updateCardSchedule(flashcardId, updatedSchedulingMetadata);
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
        const fingerprint = isParagraph(block) ? block.fingerprint : undefined;
        await this.flashcardNote.createCard(annotationId, question, answer, cardType, fingerprint);
    }

    async deleteFlashcard(id: string) {
        await this.flashcardNote.deleteCard(id);
        this.reviewDeck = this.reviewDeck.filter(t=>t.id !== id);
    }

    resetReview() {
        this.generateReviewDeck();
        this.reviewIndex = -1;
    }

    getReviewStats() {
        this.resetReview();
        const { annotationsWithFlashcards, annotationsWithoutFlashcards } = this.annotationCoverage();
        const annotationsWithFlashcardsCount = annotationsWithFlashcards.size;
        const annotationsWithoutFlashcardsCount = annotationsWithoutFlashcards.size;
        const progress = maturityCounts(this.flashcardNote?.flashcards || []);
        let annotationCoverage = annotationsWithFlashcardsCount / (annotationsWithFlashcardsCount + annotationsWithoutFlashcardsCount);
        // Handle NaN if both counts are 0
        if (isNaN(annotationCoverage)) annotationCoverage = 0;

        return {
            id: this.id,
            name: this.name,
            pendingFlashcards: this.reviewDeck.length,
            annotationCoverage: annotationCoverage,
            flashcardProgress: progress
        };
    }

    getBookFrontmatter(): BookFrontmatter | null {
        try {
            const metadata = getMetadataForFile(this.path);
            const frontmatter = metadata?.frontmatter;

            if (frontmatter) {
                if (
                    frontmatter.path &&
                    frontmatter.title &&
                    frontmatter.lastExportedTimestamp !== undefined &&
                    frontmatter.lastExportedID !== undefined
                ) {
                    return {
                        id: this.id, // Assign AnnotationsNote's ID
                        path: frontmatter.path, // This is the mrexpt path
                        annotationsPath: this.path, // This is the Annotations.md path
                        title: frontmatter.title,
                        author: frontmatter.author || "",
                        lastExportedTimestamp: frontmatter.lastExportedTimestamp,
                        lastExportedID: frontmatter.lastExportedID,
                        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
                    };
                } else {
                    console.warn(`Skipping malformed frontmatter in ${this.path}`);
                }
            }
        } catch (e) {
            console.error(`Error processing source note ${this.path}:`, e);
        }
        return null;
    }

    async updateFlashcardContents(flashcardId: string, question: string, answer: string, cardType: CardType = CardType.MultiLineBasic) {
        if (cardType == CardType.MultiLineBasic) {
            await this.flashcardNote.updateCardContents(flashcardId, question, answer, cardType);
        }
        return true;
    }

    async updateAnnotation(annotationId: string, updates: Partial<annotation>) {
        const annotationIndex = this.bookSections.findIndex(t => t.id === annotationId);
        if (annotationIndex === -1) throw new Error(`updateAnnotation: annotation not found for id ${annotationId}`);
        const originalAnnotation = this.bookSections[annotationIndex];
        // todo: commented out because it causes test failures but actually works in production. need to update tests i think
        // if (!isAnnotation(originalAnnotation)) throw new Error(`updateAnnotation: section ${annotationId} is not an annotation`);

        const originalMarkdown = renderAnnotation(originalAnnotation);
        
        // Apply updates
        const updatedAnnotation = { ...originalAnnotation, ...updates };
        const updatedMarkdown = renderAnnotation(updatedAnnotation);

        const writeSuccessful = await updateCardOnDisk(this.path, originalMarkdown, updatedMarkdown);
        if (writeSuccessful) {
            this.bookSections[annotationIndex] = updatedAnnotation;
        }
        return writeSuccessful;
    }

    async createFlashcardNote() {
        const {filename, path} = generateFlashcardsFileNameAndPath(this.path);
        await createFlashcardsFileForBook(this.path, path);
        this.flashcardNote = await new FlashcardNote(path);
        // WARN: this seems hacky, should I create another method?
        this.flashcardNote.parentPath = this.path;
    }
}

export class AnnotationsNoteIndex {
    sourceNotes: AnnotationsNote[]

    constructor() {
        this.sourceNotes = [];
    }

    async initialize(plugin: AnnotationsNoteDependencies) {

        const candidatePaths = selectEligibleSourcePaths(plugin.fileTagsMap);
        const notesWithAnnotations = candidatePaths.map((t: string) => new AnnotationsNote(t, plugin));
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

    getSourcesWithoutFlashcards(): AnnotationsNote[] {
        return this.sourceNotes.filter(t => !t.flashcardNote);
    }

    getAllAnnotationsNotes(): AnnotationsNote[] {
        return this.sourceNotes;
    }
}
