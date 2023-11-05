import React, { useEffect, useRef } from "react";
import { Link, useLoaderData } from "react-router-dom";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationsForSection } from "src/api";

export interface AnnotationsLoaderParams {
    bookId: string;
    sectionId: string;
}

export function annotationsLoader({params}: {params: AnnotationsLoaderParams}) {
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

// Stored as a global variable because refs are getting destroyed when navigating to another page
// Also, I can't pass state that I passed to the next page back to this page
// because I can't change the navigate call I am using in root.tsx to go back 1 page in the history
// <ScrolLRestoration/> component also did not work correctly inside the list of highlights
// regardless of using preventScrollReset or not
// TODO: investigate if using global variables in React is discouraged
// will probably end up keeping this anyway as I couldn't find a better solution
let locationId: string = "";

export function AnnotationList() {
    const chapterData = useLoaderData() as SectionAnnotations;
    const itemsRef = useRef<Map<string, HTMLAnchorElement>>();

    useEffect(() => {
        if (locationId != ""){
            scrollToId(locationId)
        }
    }, [locationId]);

    // getMap and scrollToId were copied from Deep Dive section under 
    // (at the time) modern react ref docs:
    // https://react.dev/learn/manipulating-the-dom-with-refs#example-scrolling-to-an-element
    function getMap() {
        if (!itemsRef.current) {
            itemsRef.current = new Map();
        }
        return itemsRef.current;
    }

    function scrollToId(itemId: string) {
        const map = getMap();
        console.log(map);
        const node = map.get(itemId);
        if (!node) {
            throw new Error("scrollToId: unable to find node to scroll to")
        }
        node.scrollIntoView({
            behavior: 'smooth',
            block: 'nearest',
            inline: 'center'
        });
    }

    return (
        <>
            {/*
             TODO: This needs to be replaced with the chapter and the highlights done and remaining
             */}
            <h3>
                {chapterData.title}
            </h3>
            <HeaderWithCounts withCount={0} withoutCount={0}/>

            {/*<>*/}
            {/*    {uniqueHighlightColors.map((t: string)=>(*/}
            {/*        <button*/}
            {/*            className={`sr-highlight-filter${color == t ? " active" : ""}`}*/}
            {/*            style={{"backgroundColor": `${t}`}}*/}
            {/*            onClick={() => colorFilterHandler(t)}*/}
            {/*        />*/}
            {/*    ))}*/}
            {/*</>*/}

            <p>Add flashcards from:</p>
            <ul className={"sr-highlight-tree"}>
                {chapterData.annotations.map((annotation: annotation) => (
                    <div key={annotation.id} >
                        <Link 
                            to={`${annotation.id}/flashcards`} 
                            onClick={() => {
                                console.log("setting ref")
                                locationId = annotation.id;
                            }}
                            // see comment on getMap() to understand why this is used
                            ref={(node) => {
                                const map = getMap();
                                if (node) {
                                    map.set(annotation.id, node);
                                } else {
                                    map.delete(annotation.id);
                                }
                            }}
                        >
                            <li className={"sr-highlight tree-item-self is-clickable"} >
                                <span className={"sr-annotation-text"}>
                                    {annotation.highlight}
                                </span>
                                <span>
                                    <span className={"no-tests tree-item-flair sr-test-counts"}>
                                        {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                                        {annotation.flashcardCount}
                                    </span>
                                </span>
                            </li>
                        </Link>
                    </div>
                ))}
            </ul>
        </>
    );
}