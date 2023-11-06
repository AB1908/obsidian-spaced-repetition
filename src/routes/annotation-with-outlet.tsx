import { Outlet, useLoaderData } from "react-router";
import { NoteAndHighlight } from "src/ui/components/note-and-highlight";
import React, { useEffect, useRef } from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationById, getNextAnnotationId, getPreviousAnnotationId } from "src/api";
import type { AnnotationsLoaderParams } from "src/ui/components/highlights";
import { Link, useLocation, useParams } from "react-router-dom";
import { setIcon } from "obsidian";
import { Icon } from "src/routes/root";

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

export function AnnotationWithOutlet() {
    const annotation = useLoaderData() as annotation;
    const backButtonRef = useRef<HTMLDivElement>(null);
    const nextButtonRef = useRef<HTMLDivElement>(null);
    const params = useParams<keyof AnnotationLoaderParams>();
    const location = useLocation();
    const previousAnnotationId = getPreviousAnnotationId(annotation.id, params.bookId);
    const nextAnnotationId = getNextAnnotationId(annotation.id, params.bookId);

    useEffect(() => {
        const back: Icon = "chevron-left";
        const front: Icon = "chevron-right";
        // todo: figure out how to fix this
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(backButtonRef.current, back);
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        setIcon(nextButtonRef.current, front);
    }, []);

// todo: disable allowing switching on preview existing flashcards route
    return (
        <>
            <div className={"sr-annotation"}>
                {previousAnnotationId &&
                    <Link to={`${location.pathname.replace(annotation.id, previousAnnotationId)}`} replace className={"annotation-nav is-clickable"}>
                        <div ref={backButtonRef}>
                        </div>
                    </Link>
                }
                <NoteAndHighlight highlightText={annotation.highlight} noteText={annotation.note} />
                {nextAnnotationId &&
                    <Link to={`${location.pathname.replace(annotation.id, nextAnnotationId)}`} replace className={"is-clickable annotation-nav"}>
                        <div ref={nextButtonRef}>
                        </div>
                    </Link>
                }
            </div>
            <Outlet />
        </>
    );
}
