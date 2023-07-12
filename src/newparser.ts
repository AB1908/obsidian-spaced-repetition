import {HeadingCache, SectionCache} from "obsidian";

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