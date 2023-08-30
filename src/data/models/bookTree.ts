// This is terrible. Save me.
import {annotation} from "src/data/import/annotations";
import {BookMetadataSections, Count, findPreviousHeader, Heading, isAnnotation, isHeading} from "src/data/models/book";

function writeCountToObj(mem: any, sectionId: string, count: number, key: string) {
    Object.assign(mem, {[`${sectionId}`]: {...mem[sectionId], [key]: count}});
}

/*
This function is invoked twice to do a section tree walk, to figure out how many annotations have flashcards associated
with them and how many don't. I couldn't find a cleaner way of doing it without being too clever for myself.
 */
function countAnnotations(sections: any, mem: any, injectedCondition: (sections: any) => boolean, key: string) {
    let count = 0;
    if ("children" in sections) {
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
export function AnnotationCount(sections: any): Record<string, Count> {
    let mem = {};
    // @ts-ignore
    mem[sections.id] = {
        "without": countAnnotations(sections, mem, (sections: any) => sections.hasFlashcards == false, "without"),
        "with": countAnnotations(sections, mem, (sections: any) => sections.hasFlashcards == true, "with")
    }
    return mem;
}

// Need this to be able to call countAnnotations

// TODO: why did I make this? Where do I need it?
// TODO: refactor
// TODO: think about heading collisions as there may be multiple chapters with same name
// TODO: don't need to nest paragraphs I think
// TODO: fix type
export function generateTree(sections: Heading[]) {
    let i = 0;
    let prevHeader;
    while (i < sections.length) {
        let cacheItem = sections[i];
        if (isHeading(cacheItem)) {
            // if (!("children" in cacheItem)) {
            //     cacheItem.children = [];
            // }
            // cacheItem.count = {"with": 0, "without": 0};
        } else {
            prevHeader = findPreviousHeader(cacheItem, sections);
            const previousHeader = sections[prevHeader] as Heading;
            if (prevHeader != null) {
                previousHeader.children.push(cacheItem);
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
            if ((isHeading(each)) && (each.level == headingLevel)) {
                let prevHeader = findPreviousHeader(each, sections);
                let previousHeader = sections[prevHeader] as Heading;
                previousHeader.children.push(each);
            }
            sectionIndex++;
        }
    }
    return sections.filter(t => isHeading(t) && t.level == 1);
}

export function generateSectionsTree(sections: (annotation | Heading)[]) {
    const headings: Heading[] = structuredClone(sections.filter((t): t is Heading => isHeading(t)));
    return generateTree(headings);
}