import { BookMetadataSections, findPreviousHeaderForHeading, type Heading, isHeading } from "src/data/models/AnnotationsNote";

// KILL: switch to DFS/BFS?
// Need this to be able to call countAnnotations

// DONE: why did I make this? Where do I need it?
// DONE: refactor
// TODO: think about heading collisions as there may be multiple chapters with same name
// KILL: don't need to nest paragraphs I think
// DONE: fix type

export function generateTree(sections: Heading[]) {
    let i = 0;
    let prevHeader;
    while (i < sections.length) {
        const cacheItem = sections[i];
        if (!isHeading(cacheItem)) {
            prevHeader = findPreviousHeaderForHeading(cacheItem, sections);
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
            const each = sections[sectionIndex];
            if ((isHeading(each)) && (each.level == headingLevel)) {
                const prevHeader = findPreviousHeaderForHeading(each, sections);
                const previousHeader = sections[prevHeader] as Heading;
                previousHeader.children.push(each);
            }
            sectionIndex++;
        }
    }
    return sections.filter(t => isHeading(t) && t.level == 1);
}

export function generateSectionsTree(sections: BookMetadataSections) {
    const headings: Heading[] = structuredClone(sections.filter((t): t is Heading => isHeading(t)));
    return generateTree(headings);
}