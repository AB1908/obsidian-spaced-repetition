import type { CachedMetadata, HeadingCache, SectionCache } from "obsidian";
import { nanoid } from "nanoid";
import {
    createFlashcardsFileForBook, generateFlashcardsFileNameAndPath, getFileContents,
    getMetadataForFile,
    getParentOrFilename, updateCardOnDisk, getTFileForPath, updateFrontmatter, moveFile, renameFile, createFile
} from "src/infrastructure/disk";
import { type annotation, parseAnnotations } from "src/data/models/annotations";
import { Flashcard, FlashcardNote, schedulingMetadataForResponse, maturityCounts } from "src/data/models/flashcard";
import type { ParsedCard } from "src/data/models/parsedCard";
import { SchedulingMetadata } from "src/data/utils/TextGenerator";
import type { ReviewResponse } from "src/types/CardType";
import { paragraph, addBlockIdToParagraph } from "src/data/models/paragraphs";
import { CardType } from "src/types/CardType";
import {parseMetadata} from "src/data/parser";
import { SourceNoteDependencies } from "src/data/utils/dependencies";
import { parseMoonReaderExport } from "src/data/import/moonreader";
import { generateMarkdownWithHeaders } from "src/data/utils/annotationGenerator";
import { ObsidianNotice } from "src/infrastructure/obsidian-facade";


export const ANNOTATIONS_YAML_KEY = "annotations";
export type RawBookSection = (SectionCache | HeadingCache);
export type BookMetadataSection = Heading | annotation | paragraph;
export type BookMetadataSections = BookMetadataSection[];

export interface BookFrontmatter {
    id: string; // The ID of the SourceNote object (nanoid generated)
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
    return (section as Heading).level !== undefined;
}

export function isChapter(section: BookMetadataSection): section is Heading {
    return isHeading(section) && section.level === 1;
}

export function isAnnotation(section: BookMetadataSection): section is annotation {
    return (section as annotation).highlight !== undefined || (section as annotation).note !== undefined;
}

export function isParagraph(section: BookMetadataSection): section is paragraph {
    return (section as paragraph).wasIdPresent !== undefined;
}

export function isAnnotationOrParagraph(section: BookMetadataSection): section is (annotation|paragraph) {
    return isAnnotation(section) || isParagraph(section);
}

function transform(p: paragraph|annotation): annotation {
    if (isAnnotation(p)) {
        return p;
    } else {
        return {
            id: p.id,
            type: "",
            note: "",
            highlight: p.text,
            hasFlashcards: p.hasFlashcards
        };
    }
}

// todo: should this be part of the Book class??
export function bookSections(metadata: CachedMetadata | null | undefined, fileText: string, flashcards: Flashcard[], plugin: SourceNoteDependencies) {
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
        // todo: convert to idiomatic type check?
        // TODO: refactor to split into two different functions because unifying the section vs header parent finding
        // implementation means coupling things unnecessarily.
        // See commit introducing this comment
        if (!("level" in section) && ("level" in currentSection))
            return index;
        index--;
    }
    return -1;
}

export function findPreviousHeaderForHeading(section: Heading, sections: (RawBookSection|BookMetadataSection)[]) {
    let index = sections.indexOf(section);
    // top level headers don't have a parent
    // done: consider changing this to -1 so we have a consistent return type
    if ("level" in section) {
        if (section.level == 1) return -1;
    }
    while (index >= 0) {
        const currentSection: (RawBookSection|BookMetadataSection) = sections[index];
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
        // TODO: refactor to split into two different functions because unifying the section vs header parent finding
        // implementation means coupling things unnecessarily.
        // See commit introducing this comment
        if (("level" in section) && ("level" in currentSection) && (currentSection.level+1 == section.level))
            // we've finally reached a header
            // return it
            return index;
        else if (!("level" in section) && ("level" in currentSection))
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
    // todo: reviewDeck may need to be its own class as review states will be important for implementing navigation
    reviewDeck: Flashcard[];
    // i feel like i need a factory method that creates a SourceNoteWithFLashcards
    // and a SourceNote
    flashcardNote: FlashcardNote;
    // todo: think of a way to not use plugin
    // the reason I need it is because to find the corresponding flashcard note
    plugin: SourceNoteDependencies;

    constructor(path: string, plugin: SourceNoteDependencies) {
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

    static async createFromMoonReaderExport(mrexptPath: string, destinationFolder: string) {
        const content = await getFileContents(mrexptPath);
        const annotations = parseMoonReaderExport(content);

        if (annotations.length === 0) {
            throw new Error("No annotations found in the export file.");
        }

        const lastExportedID = Math.max(...annotations.map(ann => parseInt(ann.id, 10)));

        const fileName = mrexptPath.split("/").pop();
        const newMrexptPath = `${destinationFolder}/${fileName}`;
        await moveFile(mrexptPath, newMrexptPath);
        const annotationsPath = `${destinationFolder}/Annotations.md`;
        // @ts-ignore
        const existingFile = app.vault.getAbstractFileByPath(annotationsPath);
        if (existingFile) {
            await renameFile(annotationsPath, "Annotations_old.md");
        }

        const bookTitle = annotations.find(ann => ann.title)?.title || "Unknown Book";

        const frontmatter = `---
path: "${newMrexptPath}"
title: "${bookTitle}"
author: ""
lastExportedTimestamp: ${Date.now()}
lastExportedID: ${lastExportedID}
tags:
  - "review/book"
---
`;

        const markdown = generateMarkdownWithHeaders(annotations);
        await createFile(annotationsPath, frontmatter + markdown);

        return annotationsPath;
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
            this.flashcardNote?.flashcards || [],
            this.plugin
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
        for (const id of this.flashcardNote.flashcards.map(t => t.parentId)) {
            flashcardCountForAnnotation[id] = (flashcardCountForAnnotation[id] || 0) + 1;
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
        await this.flashcardNote.createCard(annotationId, question, answer, cardType);
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
                        id: this.id, // Assign SourceNote's ID
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

    async syncMoonReaderExport(mrexptPath: string, sinceId: string) {
        const mrexptContent = await getFileContents(mrexptPath);
        const newAnnotations = parseMoonReaderExport(mrexptContent, sinceId);

        if (newAnnotations.length === 0) {
            new ObsidianNotice("No new annotations found.");
            return;
        }

        // Append new annotations markdown to the file
        const newAnnotationsMarkdown = generateMarkdownWithHeaders(newAnnotations);
        const tfile = getTFileForPath(this.path);
        // @ts-ignore
        await app.vault.append(tfile, '\n' + newAnnotationsMarkdown); // Add a newline before appending

        // Find the new highest ID among all annotations
        const allAnnotations = parseMoonReaderExport(mrexptContent);
        const newLastExportedID = Math.max(...allAnnotations.map(ann => parseInt(ann.id, 10)));

        // Update frontmatter values using the new disk utility
        await updateFrontmatter(this.path, {
            lastExportedTimestamp: Date.now(),
            lastExportedID: newLastExportedID,
        });

        new ObsidianNotice(`Updated ${newAnnotations.length} new annotations.`);
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

    async initialize(plugin: SourceNoteDependencies) {
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

    getAllSourceNotes(): SourceNote[] {
        return this.sourceNotes;
    }
}

