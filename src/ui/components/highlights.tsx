import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getAnnotationsForSection} from "src/controller";

export function annotationsLoader({params}: {params: any}) {
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

export function HighlightsList() {
    const chapterData: any = useLoaderData() as SectionAnnotations;
    // const [color, setColor] = useState(null);
    // const uniqueHighlightColors = [...new Set(chapterData.highlights.map((t: any) => t.color))];
    // let filteredHighlights = color === null ? chapterData.highlights : chapterData.highlights.filter(t=>t.color === color);

    // function colorFilterHandler(t: string) {
    //    setColor((currentState: string) =>{
    //        if (currentState != t) {
    //            return t;
    //        } else {
    //            return null;
    //        }
    //    });
    // }

    return (
        <>
            {/*
             TODO: This needs to be replaced with the chapter and the highlights done and remaining
             */}
            <h3>
                {chapterData.title}
            </h3>
            <HeaderWithCounts withCount={29} withoutCount={30}/>

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
                {chapterData.annotations.map((annotation: annotation, i: number) => (
                    <div key={annotation.id} >
                        <Link to={`${annotation.id}/flashcards`}>
                            <li className={"sr-highlight tree-item-self is-clickable"}>
                                {annotation.highlight}
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