import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";

export function chapterLoaderData({params}: {params: any}) {
    return fetch(`http://localhost:3000/annotationsBySection/${params.sectionId}`);
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
    const chapterData: any = useLoaderData();
    const [color, setColor] = useState(null);
    const uniqueHighlightColors = [...new Set(chapterData.highlights.map((t: any) => t.color))];
    let filteredHighlights = color === null ? chapterData.highlights : chapterData.highlights.filter(t=>t.color === color);

    function colorFilterHandler(t: string) {
       setColor((currentState: string) =>{
           if (currentState != t) {
               return t;
           } else {
               return null;
           }
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
            <HeaderWithCounts withCount={29} withoutCount={30}/>

            <>
                {uniqueHighlightColors.map((t: string)=>(
                    <button
                        className={`sr-highlight-filter${color == t ? " active" : ""}`}
                        style={{"backgroundColor": `${t}`}}
                        onClick={() => colorFilterHandler(t)}
                    />
                ))}
            </>

            <p>Add flashcards from:</p>
            <ul className={"sr-highlight-tree"}>
                {filteredHighlights.map((highlight: any, i: number) => (
                    <div>
                        <Link to={`${i}/flashcards`}>
                            <li key={highlight.id} className={"sr-highlight tree-item-self is-clickable"}>
                                {highlight.highlightContent}
                                <span>
                                    <span className={"no-tests tree-item-flair sr-test-counts"}>
                                        {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                                        {20}
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