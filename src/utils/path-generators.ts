import { generatePath, matchPath, useLocation } from "react-router-dom";

export function pathGenerator(path: string, params: any, annotationId: string) {
    console.log(path, params, annotationId);
    
    const routes = [
        "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/:flashcardId",
        "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/new/regular",
        "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards/new",
        "/books/:bookId/chapters/:sectionId/annotations/:annotationId/flashcards",
        "/books/:bookId/chapters/:sectionId/annotations/:annotationId",
        "/import/books/:bookId/chapters/:sectionId/annotations/:annotationId/personal-note"
    ];

    for (const routePath of routes) {
        if (matchPath(routePath, path)) {
            return generatePath(routePath, { ...params, annotationId });
        }
    }

    throw new Error("could not match path in AnnotationOutlet");
}
