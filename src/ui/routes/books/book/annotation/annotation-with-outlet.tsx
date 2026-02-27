import { Outlet, useLoaderData, useNavigate, useParams, useLocation } from "react-router-dom";
import React, { useEffect } from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_JSON_MOCK } from "src/ui/routes/books/review";
import { getAnnotationById, getBreadcrumbData, type NavigationFilter } from "src/api";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { pathGenerator } from "src/utils/path-generators";
import {
    AnnotationLoaderParams,
    getNextAnnotationIdForSection,
    getPreviousAnnotationIdForSection
} from "src/ui/routes/books/api";
import NavigationControl from "src/ui/components/NavigationControl";

const NAVIGATION_FILTER_SESSION_KEY = "annotationNavigationFilter";

function getNavigationFilterFromSessionStorage(): NavigationFilter | undefined {
    const serializedFilter = sessionStorage.getItem(NAVIGATION_FILTER_SESSION_KEY);
    if (!serializedFilter) return undefined;

    try {
        return JSON.parse(serializedFilter) as NavigationFilter;
    } catch {
        return undefined;
    }
}

export async function annotationLoader({ params }: {
    params: AnnotationLoaderParams
}) {
    if (!USE_JSON_MOCK) {
        const { bookName, sectionName } = getBreadcrumbData(params.bookId, params.sectionId);
        return {
            annotation: getAnnotationById(params.annotationId, params.bookId),
            bookName,
            sectionName,
        };
    } else
        return fetch(`http://localhost:3000/annotations/${params.annotationId}`);
}

interface TitleMatchData {
    bookName?: string;
    sectionName?: string;
}

interface AnnotationTitleMatch {
    data?: TitleMatchData;
}

export function annotationBreadcrumbTitle(match: AnnotationTitleMatch): string | undefined {
    const bookName = match?.data?.bookName;
    const sectionName = match?.data?.sectionName;
    if (!bookName) {
        return undefined;
    }
    if (!sectionName) {
        return bookName;
    }
    return `${bookName} / ${sectionName}`;
}

export function AnnotationWithOutlet() {
    const loaderData = useLoaderData() as annotation | { annotation: annotation };
    const annotationData = loaderData as { annotation?: annotation };
    const annotation = annotationData.annotation ?? (loaderData as annotation);
    const params = useParams<keyof AnnotationLoaderParams>();
    const location = useLocation();
    const navigate = useNavigate();
    const navigationFilter = getNavigationFilterFromSessionStorage();

    // todo: investigate TS error. This route is not reachable without book id so no idea why params.bookId can be null
    // maybe it is implicit definition on params object
    const previousAnnotationId = getPreviousAnnotationIdForSection(params.bookId, params.sectionId, annotation.id, navigationFilter);
    const nextAnnotationId = getNextAnnotationIdForSection(params.bookId, params.sectionId, annotation.id, navigationFilter);

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
                    navigationKey={annotation.id}
                />
                <div style={{ width: '100%' }}>
                    <HighlightBlock text={annotation.highlight} />
                    {annotation.note && <NoteBlock text={annotation.note} />}
                </div>
                <NavigationControl
                    onClick={() => handleNavigate(nextAnnotationId)}
                    isDisabled={!nextAnnotationId}
                    direction="next"
                    navigationKey={annotation.id}
                />
            </div>
            <Outlet />
        </>
    );
}


