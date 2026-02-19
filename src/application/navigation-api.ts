import type { annotation } from "src/data/models/annotations";
import { paragraph } from "src/data/models/paragraphs";
import { isAnnotationOrParagraph, isHeading } from "src/data/models";
import { AnnotationFilter, matchesAnnotationFilter } from "src/utils/annotation-filters";
import { getPluginContext } from "./plugin-context";

export type NavigationFilter = AnnotationFilter;

export function getPreviousAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);
    if (index === -1) return null;

    for (let i = index - 1; i >= 0; i--) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null;
            continue;
        }
        if (isAnnotationOrParagraph(item)) {
            const ann = item as (annotation | paragraph);
            if (!matchesAnnotationFilter(ann, filter)) continue;
            return ann.id;
        }
    }
    return null;
}

export function getNextAnnotationId(
    bookId: string,
    blockId: string,
    sectionId?: string,
    filter?: NavigationFilter
) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    const index = book.bookSections.findIndex(t => t.id === blockId);
    if (index === -1) return null;

    for (let i = index + 1; i < book.bookSections.length; i++) {
        const item = book.bookSections[i];
        if (isHeading(item)) {
            if (sectionId) return null;
            continue;
        }
        if (isAnnotationOrParagraph(item)) {
            const ann = item as (annotation | paragraph);
            if (!matchesAnnotationFilter(ann, filter)) continue;
            return ann.id;
        }
    }
    return null;
}

export function getBreadcrumbData(bookId: string, sectionId?: string) {
    const plugin = getPluginContext();
    const book = plugin.annotationsNoteIndex.getBook(bookId);
    let sectionName: string | undefined;

    if (sectionId) {
        const chapter = book.bookSections.find(
            (section) => section.id === sectionId
        );
        if (chapter && chapter.type === "heading") {
            sectionName = chapter.name;
        }
    }

    return {
        bookName: book.name,
        sectionName,
    };
}
