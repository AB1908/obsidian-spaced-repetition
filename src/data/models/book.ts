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

export async function createBook(path: string) {
    // some assumptions: one book note or multiple?
    const book = {
        path: path,
        contents: await getFileContents(path),
        // metadata: await getFileMetadata(path)
    }

    // get file contents
    // get file metadata
    // create array of sections
    // assign every section a uuid? This doesn't work. I need to get all annotations for a section
    // either by walking the tree or by finding all content up to the next section of the next level

    // create array of just paragraphs
    // create annotations array
    // push that into global annotation index
    //

    // i need a count of all annotations that are tested and not tested
    // i need section trees
    // let's put flashcard list here because I know it will be in the same folder
    // i should be able to get a list of annotations for any given section
    // i should be able to get a list of flashcards for any annotation
    // need to parse flashcards first so I know which annotations are covered and which are not
    // need a get next header function so i can find paragraphs belonging to current header
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

export interface AnnotationWithFlashcard extends annotation {
    hasFlashcard: boolean;
}

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
    path:           string;
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
    path: string;

    constructor(path: string, name: string) {
        this.id = nanoid(8);
        this.path = path;
        this.name = name;
        this.parsedCards = [];
        this.flashcards = [];
        this.annotationPath = null;
        this.bookSections = [];
    }

    async initialize() {
        this.parsedCards = await parseFileText(this.path);
        this.flashcards = generateFlashcardsArray(this.parsedCards);
        const annotationTFile = getAnnotationFilePath(this.path);
        if (annotationTFile) {
            this.annotationPath = annotationTFile.path;
            this.bookSections = bookSections(
                getMetadataForFile(annotationTFile.path),
                await getFileContents(annotationTFile.path),
                this.flashcards
            );
            this.bookSections = generateHeaderCounts(this.bookSections);
        }
        return this;
    }

    annotations() {
        return this.bookSections.filter((t): t is annotation => isAnnotation(t));
    }
}