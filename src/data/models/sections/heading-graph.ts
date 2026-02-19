import type { HeadingCache } from "obsidian";
import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import { isHeading } from "./guards";
import type { BookMetadataSection, BookMetadataSections, Count, RawBookSection } from "./types";
import { Heading } from "./types";

export function findPreviousHeaderForSection(
    section: annotation | paragraph,
    sections: (RawBookSection | BookMetadataSection)[]
) {
    let index = sections.indexOf(section);
    while (index >= 0) {
        const currentSection: RawBookSection | BookMetadataSection = sections[index];
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

export function findPreviousHeaderForHeading(section: Heading, sections: (RawBookSection | BookMetadataSection)[]) {
    let index = sections.indexOf(section);
    const sectionIsHeading = "level" in section;
    // top level headers don't have a parent
    if (sectionIsHeading && section.level == 1) return -1;
    while (index >= 0) {
        const currentSection: RawBookSection | BookMetadataSection = sections[index];
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
