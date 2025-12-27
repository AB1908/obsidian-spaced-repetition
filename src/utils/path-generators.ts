import { generatePath, matchPath } from "react-router-dom";

export function pathGenerator(path: string, params: any, annotationId: string) {
    // all this validation may not be necessary but keeping it since I already wrote it
    const updateFlashcardPath = "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/:flashcardId";
    const newRegularFlashcardPath= "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/new/regular";
    const newFlashcardPath = "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/new";
    const viewFlashcardsPath = "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards";
    const inChildRoute = [updateFlashcardPath, newRegularFlashcardPath, newFlashcardPath, viewFlashcardsPath].some((routePath) => {
        return matchPath(routePath, path);
    })
    if (inChildRoute) {
        return generatePath(viewFlashcardsPath, {...params, annotationId});
    } else {
        throw new Error("could not match path in AnnotationOutlet");
    }
}
