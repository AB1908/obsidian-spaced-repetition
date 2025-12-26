import React from "react";
import { Link, useLoaderData, useLocation } from "react-router-dom";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationsForSection } from "src/api";
import { type LoaderFunctionArgs } from "react-router";

export interface AnnotationsLoaderParams {
    bookId: string;
    sectionId: string;
}

// https://github.com/remix-run/react-router/discussions/11244#discussioncomment-8347707
// inspiration for LoaderFunctionArgs typing fix
export function annotationsLoader({params}: LoaderFunctionArgs & {params: AnnotationsLoaderParams}) {
    if (USE_ACTUAL_BACKEND)
        return getAnnotationsForSection(params.sectionId, params.bookId);
    else
        return fetch(`http://localhost:3000/annotationsBySection/${params.sectionId}`);
}

export interface SectionAnnotations {
    id:          string;
    annotations: annotation[];
    title:       string;
}

interface annotation {
    id:             string;
    type:           string;
    highlight:      string;
    note:           string;
    // TODO: do something about this optional thingy
    flashcardCount: number;
}

export function HeaderWithCounts(props: { withoutCount: number, withCount: number }) {
    return (
        <h4>
            <span
                className={"no-tests tree-item-flair sr-test-counts"}
                aria-label={"Cards without tests"}
            >
                {props.withoutCount}
            </span>
            <span
                className={"no-tests tree-item-flair sr-test-counts"}
                aria-label={"Cards without tests"}
            >
                {props.withCount}
            </span>
        </h4>
    );
}

function AnnotationListItem(props: { annotation: annotation }) {
    return <div id={props.annotation.id}>
        <Link
            to={`${props.annotation.id}/flashcards`}
            state={{scrollId: props.annotation.id}}
            onClick={() => sessionStorage.setItem('scrollToAnnotation', props.annotation.id)}
        >
            <li className={"sr-highlight tree-item-self is-clickable"}>
                <span className={"sr-annotation-text"}>
                    {props.annotation.highlight}
                </span>
                <span>
                    <span className={"no-tests tree-item-flair sr-test-counts"}>
                        {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                        {props.annotation.flashcardCount}
                    </span>
                </span>
            </li>
        </Link>
    </div>;
}

export function AnnotationList() {
    const chapterData = useLoaderData() as SectionAnnotations;
    const location = useLocation();

    //todo: don't use direct DOM manipulation one day
    React.useEffect(() => {
        const scrollId = sessionStorage.getItem('scrollToAnnotation');
        if (scrollId) {
            const element = document.getElementById(scrollId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });

                // Add highlight class
                element.classList.add('sr-annotation-highlighted');

                // Remove the class after the animation finishes
                setTimeout(() => {
                    element.classList.remove('sr-annotation-highlighted');
                }, 1500); // Must match animation duration
            }
            sessionStorage.removeItem('scrollToAnnotation');
        }
    }, [chapterData]);

    return (
        <>
            {/*
             TODO: This needs to be replaced with the chapter and the highlights done and remaining
             */}
            <h3>
                {chapterData.title}
            </h3>
            <HeaderWithCounts withCount={0} withoutCount={0}/>

            <p>Add flashcards from:</p>
            <ul className={"sr-highlight-tree"}>
                {chapterData.annotations.map((annotation: annotation) => (
                    <AnnotationListItem key={annotation.id} annotation={annotation}/>
                ))}
            </ul>
        </>
    );
}