import { generatePath, matchPath, Outlet, useLoaderData } from "react-router-dom";
import React, { useEffect, useRef } from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/ui/routes/books/review";
import { getAnnotationById } from "src/api";
import type { AnnotationsLoaderParams } from "src/ui/routes/books/AnnotationListPage";
import { Link, useLocation, useParams } from "react-router-dom";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { Icon } from "src/types/obsidian-icons";
import { paragraph } from "src/data/models/paragraphs";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { pathGenerator } from "src/utils/path-generators";
import {
    AnnotationLoaderParams,
    getNextAnnotationIdForSection,
    getPreviousAnnotationIdForSection
} from "src/ui/routes/books/api";

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
    // todo: investigate TS error. This route is not reachable without book id so no idea why params.bookId can be null
    // maybe it is implicit definition on params object
    const previousAnnotationId = getPreviousAnnotationIdForSection(params.bookId, params.sectionId, annotation.id);
    const nextAnnotationId = getNextAnnotationIdForSection(params.bookId, params.sectionId, annotation.id);


    useEffect(() => {
        if (annotation?.id) {
            sessionStorage.setItem('scrollToAnnotation', annotation.id);
        }
    }, [annotation?.id]);

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
                <div style={{ width: '100%' }}>
                    <HighlightBlock text={annotation.highlight} />
                    {annotation.note && <NoteBlock text={annotation.note} />}
                </div>
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


