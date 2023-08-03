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

export function bookSections(metadata: CachedMetadata, fileText: string, flashcards: Flashcard[]) {
    const output: (annotation|Heading)[] = [];
    const fileTextArray = fileText.split("\n");
    let headingIndex = 0;
    const annotationsWithFlashcards = new Set(...flashcards.map(t=>t.annotationId));
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

// TODO: why did I make this? Where do I need it?
// TODO: refactor
// TODO: think about heading collisions as there may be multiple chapters with same name
// TODO: don't need to nest paragraphs I think
// TODO: fix type
export function generateTree(sections: any[]) {
    let i = 0;
    let prevHeader;
    while (i < sections.length) {
        let cacheItem = sections[i];
        if ("heading" in cacheItem) {
            if (!("children" in cacheItem)) {
                cacheItem.children = [];
            }
        } else {
            prevHeader = findPreviousHeader(sections, cacheItem);
            if (prevHeader != null) {
                sections[prevHeader].children.push(cacheItem);
            }
        }
        i++;
    }

    // successively attach lower level headers to higher ones
    // TODO: remove hardcoded headers and find the deepest header dynamically?
    // May be unnecessary since no book is going to have like a 5 level header... right??
    for (let headingLevel = 4; headingLevel > 1; headingLevel--) {
        let sectionIndex = 0;
        while (sectionIndex < sections.length) {
            let each = sections[sectionIndex];
            if (("heading" in each) && (each.level == headingLevel)) {
                prevHeader = findPreviousHeader(sections, each);
                sections[prevHeader].children.push(each);
            }
            sectionIndex++;
        }
    }
    return sections.filter(t => "heading" in t && t.level == 1);
}

export function findPreviousHeader(sections: (SectionCache | HeadingCache)[], section: SectionCache | HeadingCache) {
    let start = sections.indexOf(section);
    // top level headers don't have a parent
    // TODO: consider changing this to -1 so we have a consistent return type
    if (('level' in section) && ((section as HeadingCache).level == 1)) return null;
    while (start >= 0) {
        if (section == sections[start]) start--;
        if ("level" in sections[start]) {
            if ((sections[start] as HeadingCache).level == (section as HeadingCache).level) start--;
        }
        if ("heading" in sections[start])
            return start;
        start--;
    }
    return null;
}

export function generateSectionsTree(sections: (AnnotationWithFlashcard | Heading)[]) {
    const headings: Heading[] = sections.filter((t): t is Heading => isHeading(t));
    return generateTree(headings);
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
            this.bookSections = bookSections(getMetadataForFile(annotationTFile.path), await getFileContents(annotationTFile.path));
        }
        return this;
    }

    annotations() {
        return this.bookSections.filter((t): t is annotation => isAnnotation(t));
    }
}