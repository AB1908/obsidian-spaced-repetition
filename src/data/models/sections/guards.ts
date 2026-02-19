import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import type { BookMetadataSection, Heading } from "./types";

export function isHeading(section: BookMetadataSection): section is Heading {
    return section.type === "heading";
}

export function isChapter(section: BookMetadataSection): section is Heading {
    return section.type === "heading" && section.level === 1;
}

export function isAnnotation(section: BookMetadataSection): section is annotation {
    return section.type === "annotation";
}

export function isParagraph(section: BookMetadataSection): section is paragraph {
    return section.type === "paragraph";
}

export function isAnnotationOrParagraph(section: BookMetadataSection): section is annotation | paragraph {
    return section.type === "annotation" || section.type === "paragraph";
}
