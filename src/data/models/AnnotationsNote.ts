import { Heading, type BookMetadataSections, type Count } from "./sections/types";

export { ANNOTATIONS_YAML_KEY } from "./annotations-note/constants";
export type { BookFrontmatter, book, frontbook } from "./annotations-note/types";

export type { RawBookSection, BookMetadataSection, BookMetadataSections, Count } from "./sections/types";
export { Heading } from "./sections/types";
export { isAnnotation, isAnnotationOrParagraph, isChapter, isHeading, isParagraph } from "./sections/guards";
export {
    findNextHeader,
    findPreviousHeaderForHeading,
    findPreviousHeaderForSection,
    generateHeaderCounts,
    updateHeaders,
} from "./sections/heading-graph";
export { bookSections } from "./sections/book-sections";
export { AnnotationsNote } from "./annotations-note/AnnotationsNote";
export { AnnotationsNoteIndex } from "./annotations-note/AnnotationsNoteIndex";
