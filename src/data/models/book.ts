//todo: investigate using lowdb
import {getFileContents, getTFileForPath} from "src/disk";
import {annotation, parseAnnotations} from "src/data/import/annotations";
import {CachedMetadata, HeadingCache} from "obsidian";
import {nanoid} from "nanoid";
import {Flashcard} from "src/data/models/flashcard";
import {FlashCount} from "src/routes/notes-home-page";
import {generateFlashcardsArray, parseFileText} from "src/newparser";
import {ParsedCard} from "src/data/models/parsedCard";

// TODO: this is not really a "book" per se
export interface book {
    id:       string;
    name:     string;
    children: book[];
    counts?:  Counts;
}

export interface Counts {
    flashcards: FlashCount;
    sections: Record<string, Count>
}

export interface Count {
    with:    number;
    without: number;
}

// TODO: fix duplicate interface
export interface Annot {
    id: string;
    type: string;
    highlight: string;
    note: string;
    flashcards: Flashcard[]
}

function isHeading(section: annotation|Heading): section is Heading {
    return (section as Heading).level !== undefined;
}

function isAnnotation(section: annotation|Heading): section is annotation {
    return (section as annotation).highlight !== undefined;
}

// This is terrible. Save me.
function writeCountToObj(mem: any, sectionId: string, count: number, key: string) {
    Object.assign(mem, {[`${sectionId}`]: {...mem[sectionId], [key]: count}});
}

/*
This function is invoked twice to do a section tree walk, to figure out how many annotations have flashcards associated
with them and how many don't. I couldn't find a cleaner way of doing it without being too clever for myself.
 */
function countAnnotations(sections: any, mem: any, injectedCondition: (sections: any) => boolean, key: string) {
    let count = 0;
    if (isHeading(sections)) {
        for (let child of sections.children) {
            count += countAnnotations(child, mem, injectedCondition, key);
        }
        writeCountToObj(mem, sections.id, count, key);
    } else if (isAnnotation(sections)) {
        if (injectedCondition(sections)) {
            count += 1
        }
    }
    return count;
}

// TODO: switch to DFS/BFS?
export function AnnotationCount(sections: any) {
    let mem = {};
    // @ts-ignore
    mem[sections.id] = {
        "without": countAnnotations(sections, mem, (sections: any) => sections.hasFlashcards == false, "without"),
        "with": countAnnotations(sections, mem, (sections: any) => sections.hasFlashcards == true, "with")
    }
    return mem;
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

export function bookSections(metadata: CachedMetadata, fileText: string) {
    const output: (annotation|Heading)[] = [];
    const fileTextArray = fileText.split("\n");
    let headingIndex = 0;
    for (let cacheItem of metadata.sections) {
        // todo: consider parameterizing this
        if (cacheItem.type === "callout") {
            let annotation = parseAnnotations(fileTextArray.slice(cacheItem.position.start.line, cacheItem.position.end.line+1).join("\n"));
            output.push(annotation);
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
export function getAnnotations(section: string, bookSections: BookMetadataSections) {
    const index = bookSections.findIndex(t => t.id === section);
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

// Need this to be able to call countAnnotations
export function bookTree(id: string, name: string, bookSections: BookMetadataSections) {
    return {
        id,
        name,
        children: bookSections
    };
}

export interface frontbook {
    id:             string;
    name:           string;
    path:           string;
    parsedCards:    ParsedCard[];
    flashcards:     Flashcard[];
    annotationPath: string;
    // counts: BookCounts;
}

export interface BookCounts {
    mature:   number;
    new:      number;
    learning: number;
}

// todo: refactor to improve testability
export async function deckNote(path: string): Promise<frontbook> {
    const parsedCards = await parseFileText(path);
    return {
        id: nanoid(8),
        path: path,
        name: getTFileForPath(path).parent.name,
        parsedCards: parsedCards,
        flashcards: generateFlashcardsArray(parsedCards),
        annotationPath: "",
    };
}