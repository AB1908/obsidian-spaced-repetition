import { nanoid } from "nanoid";
import {
    createFlashcardsFileForBook,
    generateFlashcardsFileNameAndPath,
} from "src/infrastructure/disk";
import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import { Flashcard, FlashcardNote } from "src/data/models/flashcard";
import type { ReviewResponse } from "src/types/CardType";
import { CardType } from "src/types/CardType";
import type { AnnotationsNoteDependencies } from "src/data/utils/dependencies";
import type { FlashcardSourceStrategy } from "../FlashcardSourceStrategy";
import { getSourceCapabilities as buildSourceCapabilities, type SourceCapabilities } from "../sourceCapabilities";
import type { BookMetadataSections, Heading } from "../sections/types";
import { isAnnotationOrParagraph, isParagraph } from "../sections/guards";
import { updateAnnotationOnDisk } from "./annotation-persistence";
import { computeAnnotationCoverage } from "./annotation-coverage";
import {
    createFlashcardForAnnotation,
    deleteFlashcardById,
    updateFlashcardContentsByType,
} from "./flashcard-mutations";
import { getProcessedAnnotationsForSection } from "./processed-annotations";
import { initializeSourceState } from "./initialize-state";
import { processFlashcardReview } from "./review-mutations";
import { shuffledReviewDeck } from "./review-deck";
import { computeReviewStats } from "./review-stats";
import { toAnnotationLike } from "./annotation-transform";
import { readBookFrontmatter } from "./frontmatter";
import { resolveSourceDisplayName } from "./source-name";
import { resolveSourceStrategy, resolveSourceType } from "./source-strategy";
import type { BookFrontmatter, frontbook } from "./types";

//todo: split review related logic into separate class??
export class AnnotationsNote implements frontbook {
    path: string;
    bookSections: BookMetadataSections;
    id: string;
    name: string;
    reviewIndex: number;
    tags: string[];
    reviewDeck: Flashcard[];
    flashcardNote: FlashcardNote | null;
    strategy: FlashcardSourceStrategy;
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
        this.strategy = resolveSourceStrategy(path, this.tags, false);
    }

    updatePath(newPath: string) {
        this.path = newPath;
        this.name = resolveSourceDisplayName(this.path, this.id);
        this.strategy = this.resolveStrategy();
    }

    async initialize() {
        const state = await initializeSourceState(this.path, this.id, this.plugin);
        this.flashcardNote = state.flashcardNote;
        this.bookSections = state.bookSections;
        this.name = state.name;
        this.tags = state.tags;
        this.strategy = state.strategy;
        this.reviewDeck = state.reviewDeck;
        return this;
    }

    getNavigableSections(): Heading[] {
        return this.strategy.getNavigableSections(this.bookSections);
    }

    getSourceType() {
        return resolveSourceType(this.tags, !!this.getBookFrontmatter());
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

    private resolveStrategy(): FlashcardSourceStrategy {
        return resolveSourceStrategy(this.path, this.tags, !!this.getBookFrontmatter());
    }

    canBeReviewed() {
        return this.reviewDeck.length != 0;
    }

    annotations() {
        return this.bookSections.filter((t): t is (annotation | paragraph) => isAnnotationOrParagraph(t));
    }

    annotationCoverage() {
        return computeAnnotationCoverage(this.annotations(), this.flashcardNote.flashcards);
    }

    getProcessedAnnotations(sectionId?: string) {
        return getProcessedAnnotationsForSection(
            this.bookSections,
            this.flashcardNote?.flashcards || [],
            sectionId
        );
    }

    getAnnotation(annotationId: string): annotation {
        const match = this.annotations().find(t => t.id === annotationId);
        if (!match) throw new Error(`Annotation not found: ${annotationId}`);
        return toAnnotationLike(match);
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

    async processCardReview(flashcardId: string, reviewResponse: ReviewResponse) {
        await processFlashcardReview(this.flashcardNote!, flashcardId, reviewResponse);
    }

    private generateReviewDeck() {
        this.reviewDeck = shuffledReviewDeck(this.flashcardNote?.flashcards || []);
    }

    async createFlashcard(annotationId: string, question: string, answer: string, cardType: CardType.MultiLineBasic) {
        await createFlashcardForAnnotation(
            this.path,
            this.bookSections,
            this.flashcardNote!,
            annotationId,
            question,
            answer,
            cardType
        );
    }

    async deleteFlashcard(id: string) {
        this.reviewDeck = await deleteFlashcardById(this.flashcardNote!, this.reviewDeck, id);
    }

    resetReview() {
        this.generateReviewDeck();
        this.reviewIndex = -1;
    }

    getReviewStats() {
        this.resetReview();
        const { annotationsWithFlashcards, annotationsWithoutFlashcards } = this.annotationCoverage();
        return computeReviewStats(
            this.id,
            this.name,
            this.reviewDeck.length,
            annotationsWithFlashcards.size,
            annotationsWithoutFlashcards.size,
            this.flashcardNote?.flashcards || []
        );
    }

    getBookFrontmatter(): BookFrontmatter | null {
        return readBookFrontmatter(this.path, this.id);
    }

    async updateFlashcardContents(
        flashcardId: string,
        question: string,
        answer: string,
        cardType: CardType = CardType.MultiLineBasic
    ) {
        return updateFlashcardContentsByType(this.flashcardNote!, flashcardId, question, answer, cardType);
    }

    async updateAnnotation(annotationId: string, updates: Partial<annotation>) {
        return updateAnnotationOnDisk(this.path, this.bookSections, annotationId, updates);
    }

    async createFlashcardNote() {
        const { filename, path } = generateFlashcardsFileNameAndPath(this.path);
        await createFlashcardsFileForBook(this.path, path);
        this.flashcardNote = await new FlashcardNote(path);
        this.flashcardNote.parentPath = this.path;
    }
}
