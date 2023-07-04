import React, {useState} from "react";
import {Link} from "react-router-dom";
import {useLoaderData} from "react-router";

export function chapterLoaderData({params}: {params: any}) {
    return {
        id: "d01812ba",
        title: "Chapter 1",
        highlights: [
        {
            id: "d91maa3h",
            color: "#339122",
            highlightContent: "Onen i-Estel Edain, ú-chebin estel anim.",
            highlightNote: "What a beautiful line by Tolkien",
            flashcards: [
                "ks991kna",
            ]
        },
        {
            id: "d91ms7d",
            color: "#338122",
            highlightContent: "This is a sample highlight but without a note",
            //TODO: think about whether this should be a null or an empty string on the backend
            highlightNote: "",
            flashcards: []
        },
        {
            // id: 'sadf89u',
            // title: "Section 1",
            // highlights: [
            //     {
                    id: "9dk1m3kg",
                    color: "#338122",
                    highlightContent: "This is a sample highlight but without a note but also in subsection 1",
                    //TODO: think about whether this should be a null or an empty string on the backend
                    highlightNote: "",
                    flashcards: []
            //     }
            // ]
        },
        {
            id: "9dk1m3jg",
            color: "#246aaa",
            highlightContent: "This is a sample highlight but without a note but also in chapter 1",
            //TODO: think about whether this should be a null or an empty string on the backend
            highlightNote: "",
            flashcards: []
        }
    ],
    };
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