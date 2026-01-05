import { Outlet, useLoaderData, useNavigate, useParams, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/ui/routes/books/review";
import { getAnnotationById } from "src/api";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { pathGenerator } from "src/utils/path-generators";
import {
    AnnotationLoaderParams,
    getNextAnnotationIdForSection,
    getPreviousAnnotationIdForSection
} from "src/ui/routes/books/api";
import NavigationControl from "src/ui/components/NavigationControl";

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
    const params = useParams<keyof AnnotationLoaderParams>();
    const location = useLocation();
    const navigate = useNavigate();

    // todo: investigate TS error. This route is not reachable without book id so no idea why params.bookId can be null
    // maybe it is implicit definition on params object
    const previousAnnotationId = getPreviousAnnotationIdForSection(params.bookId, params.sectionId, annotation.id);
    const nextAnnotationId = getNextAnnotationIdForSection(params.bookId, params.sectionId, annotation.id);

    const handleNavigate = (targetAnnotationId: string | null) => {
        if (targetAnnotationId) {
            navigate(pathGenerator(location.pathname, params, targetAnnotationId), { replace: true });
        }
    };

    useEffect(() => {
        if (annotation?.id) {
            sessionStorage.setItem('scrollToAnnotation', annotation.id);
        }
    }, [annotation?.id]);

    return (
        <>
            <div className={"sr-annotation"}>
                <NavigationControl
                    onClick={() => handleNavigate(previousAnnotationId)}
                    isDisabled={!previousAnnotationId}
                    direction="previous"
                />
                <div style={{ width: '100%' }}>
                    <HighlightBlock text={annotation.highlight} />
                    {annotation.note && <NoteBlock text={annotation.note} />}
                </div>
                <NavigationControl
                    onClick={() => handleNavigate(nextAnnotationId)}
                    isDisabled={!nextAnnotationId}
                    direction="next"
                />
            </div>
            <Outlet />
        </>
    );
}


