import type { annotation } from "src/data/models/annotations";
import type { paragraph } from "src/data/models/paragraphs";
import { isAnnotation } from "src/data/models/sections/guards";

export function toAnnotationLike(p: paragraph | annotation): annotation {
    if (isAnnotation(p)) {
        return p;
    }
    return {
        type: "annotation",
        id: p.id,
        calloutType: "",
        note: "",
        highlight: p.text,
        hasFlashcards: p.hasFlashcards,
    };
}
