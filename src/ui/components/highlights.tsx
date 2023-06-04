import React from "react";
import {Link} from "react-router-dom";
import {routes} from "src/ui/modals/flashcard-modal";
import {useLoaderData} from "react-router";
import {deck} from "src/api";

export function chapterLoaderData({params}) {
    const chapterData = deck.chapters[params.chapterId];
    return chapterData;
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

export function highlightCountReducer(chapterData: any) {
    const chapterNotesWithTests = chapterData.highlights.reduce((accumulator, currentValue) => accumulator + (currentValue.flashcards.length ? 1 : 0), 0);
    const chapterNotesWithoutTests = chapterData.highlights.length - chapterNotesWithTests;
    return {chapterNotesWithTests, chapterNotesWithoutTests};
}

export function HighlightsList() {
    const chapterData: any = useLoaderData();
    const {chapterNotesWithTests, chapterNotesWithoutTests} = highlightCountReducer(chapterData);
    return (
        <>
            {/*
             TODO: This needs to be replaced with the chapter and the highlights done and remaining
             */}
            <h3>
                {chapterData.title}
            </h3>
            <HeaderWithCounts withCount={chapterNotesWithTests} withoutCount={chapterNotesWithoutTests}/>
            <p>Add flashcards from:</p>
            <ul className={"sr-highlight-tree"}>
                {chapterData.highlights.map((highlight: any) => (
                    <div>
                        <Link to={routes.flashcardsList}>
                            <li key={highlight.id} className={"sr-highlight tree-item-self is-clickable"}>
                                {highlight.highlightContent}
                                <span>
                                    <span className={"no-tests tree-item-flair sr-test-counts"}>
                                        {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                                        {highlight.flashcards.length}
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