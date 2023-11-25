import { generatePath, matchPath, Outlet, useLoaderData, useRouteLoaderData } from "react-router";
import { NoteAndHighlight } from "src/ui/components/note-and-highlight";
import React, { useEffect, useRef } from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationById } from "src/api";
import type { AnnotationsLoaderParams, SectionAnnotations } from "src/routes/highlights";
import { Link, useLocation, useParams } from "react-router-dom";
import { setIcon } from "obsidian";
import { Icon } from "src/routes/root";
import { paragraph } from "src/data/models/paragraphs";

export interface AnnotationLoaderParams extends AnnotationsLoaderParams {
    annotationId: string;
}

export async function annotationLoader({ params }: {
    params: AnnotationLoaderParams
}) {
    // todo: use redirect
    if (USE_ACTUAL_BACKEND) {
        return getAnnotationById(params.annotationId, params.bookId);
    } else
        return fetch(`http://localhost:3000/flashcardsForAnnotation/${params.annotationId}`);
}

function getPreviousAnnotationIdForSection(annotations: (annotation|paragraph)[], blockId: string) {
    let find = annotations.findIndex(t => t.id === blockId);
    return annotations[find-1]?.id || null;
}

function getNextAnnotationIdForSection(annotations: (annotation|paragraph)[], blockId: string) {
    let find = annotations.findIndex(t => t.id === blockId);
    return annotations[find+1]?.id || null;
}

export function AnnotationWithOutlet() {
    const annotation = useLoaderData() as annotation;
    const annotationsList = useRouteLoaderData("annotationsList") as SectionAnnotations;
    const backButtonRef = useRef<HTMLDivElement>(null);
    const nextButtonRef = useRef<HTMLDivElement>(null);
    const params = useParams<keyof AnnotationLoaderParams>();
    const location = useLocation();
    const previousAnnotationId = getPreviousAnnotationIdForSection(annotationsList.annotations, annotation.id);
    const nextAnnotationId = getNextAnnotationIdForSection(annotationsList.annotations, annotation.id);

    useEffect(() => {
        const back: Icon = "chevron-left";
        const front: Icon = "chevron-right";
        // todo: figure out how to fix this
        if (previousAnnotationId) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            setIcon(backButtonRef.current, back);
        }
        if (nextAnnotationId) {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            //@ts-ignore
            setIcon(nextButtonRef.current, front);
        }
    }, [location]);

    return (
        <>
            <div className={"sr-annotation"}>
                <div className={"annotation-nav is-clickable"}>
                    {previousAnnotationId != null &&
                        <Link to={`${pathGenerator(location.pathname, params, previousAnnotationId)}`} replace className={"annotation-nav is-clickable"}>
                            <div ref={backButtonRef}>
                            </div>
                        </Link>
                    }
                </div>
                <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note} />
                <div className={"annotation-nav is-clickable"} >
                    {nextAnnotationId != null &&
                        <Link to={`${pathGenerator(location.pathname, params, nextAnnotationId)}`} replace className={"annotation-nav is-clickable"}>
                            <div ref={nextButtonRef}>
                            </div>
                        </Link>
                    }
                </div>
            </div>
            <Outlet />
        </>
    );
}

function pathGenerator(path: string, params: any, annotationId: string) {
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
