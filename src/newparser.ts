import {HeadingCache, SectionCache} from "obsidian";

// TODO: refactor
// TODO: think about heading collisions as there may be multiple chapters with same name
// TODO: don't need to nest paragraphs I think
// TODO: fix type
export function generateTree(sections: any[]) {
    let i = 0;
    let prevHeader;
    while (i<sections.length) {
        let each = sections[i];
        if ("heading" in each) {
            if (!("children" in each)) {
                each.children = [];
            }
        } else {
            prevHeader = findPreviousHeader(sections, each);
            if (prevHeader != null) {
                sections[prevHeader].children.push(each);
            }
        }
        i++;
    }

    // successively attach lower level headers to higher ones
    for (let headingLevel = 4; headingLevel > 1; headingLevel--) {
        let sectionIndex = 0;
        while (sectionIndex<sections.length) {
            let each = sections[sectionIndex];
            if (("heading" in each) && (each.level == headingLevel)) {
                prevHeader = findPreviousHeader(sections, each);
                sections[prevHeader].children.push(each);
            }
            sectionIndex++;
        }
    }
    return sections.filter(t=>"heading" in t && t.level == 1);
}

export function findPreviousHeader(sections: (SectionCache|HeadingCache)[], section: SectionCache|HeadingCache) {
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