import { generatePath, matchPath, Outlet, useLoaderData, useRouteLoaderData } from "react-router-dom";
import React, { useEffect, useRef, useState } from "react";
import type { annotation } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationById } from "src/api";
import type { AnnotationsLoaderParams, SectionAnnotations } from "src/routes/highlights";
import { Link, useLocation, useParams } from "react-router-dom";
import { setIcon } from "src/obsidian-facade";
import { Icon } from "src/routes/root";
import { paragraph } from "src/data/models/paragraphs";
import { HighlightBlock, NoteBlock } from "src/ui/components/display-blocks";
import { pathGenerator } from "src/utils/path-generators";

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
    const [displayMode, setDisplayMode] = useState<'highlight' | 'note'>('highlight');


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
            <div className={"sr-toggle-group"} style={{ display: 'flex', justifyContent: 'center', marginBottom: '10px' }}>
                <button
                    className={`sr-toggle-button ${displayMode === 'highlight' ? 'active' : ''}`}
                    onClick={() => setDisplayMode('highlight')}
                    aria-pressed={displayMode === 'highlight'}
                >
                    Highlight
                </button>
                <button
                    className={`sr-toggle-button ${displayMode === 'note' ? 'active' : ''}`}
                    onClick={() => setDisplayMode('note')}
                    aria-pressed={displayMode === 'note'}
                    disabled={!annotation.note}
                >
                    Note
                </button>
            </div>
            <div className={"sr-annotation"}>
                <div className={"annotation-nav is-clickable"}>
                    {previousAnnotationId != null &&
                        <Link to={`${pathGenerator(location.pathname, params, previousAnnotationId)}`} replace className={"annotation-nav is-clickable"}>
                            <div ref={backButtonRef}>
                            </div>
                        </Link>
                    }
                </div>
                {displayMode === 'highlight' ?
                    <HighlightBlock text={annotation.highlight} /> :
                    annotation.note && <NoteBlock text={annotation.note} />
                }
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


