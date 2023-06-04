import React from "react";
import {Link} from "react-router-dom";
import {routes} from "src/ui/modals/flashcard-modal";
import {HeaderWithCounts, highlightCountReducer} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";
import {deck} from "src/api";

export function chapterLoader() {
    return deck;
}

export function countKeyInArray(key: string, array: any) {
    return array.reduce((accumulator: number, currentValue: any) => accumulator + currentValue[key], 0);
}

// TODO: Fix reduce for counts
export function ChapterList() {
    const deck1 = useLoaderData();
    let chapterList = deck1.chapters;

    chapterList = chapterList.map(chapter=>{return {...highlightCountReducer(chapter),...chapter}});
    console.log(chapterList)
    const chapterHighlightsWithTests = chapterList.reduce((accumulator, initialValue) => accumulator + initialValue.chapterNotesWithTests,0)
    const chapterHighlightsWithoutTests = chapterList.reduce((accumulator, initialValue) => accumulator + initialValue.chapterNotesWithoutTests,0)
    return (
        <>
            <h3>
                {deck1.deckName}
            </h3>
            <HeaderWithCounts
                withCount={chapterHighlightsWithTests}
                withoutCount={chapterHighlightsWithoutTests}
            />
            <p>Add flashcards from:</p>
            <ul className={"sr-chapter-tree"}>
                {chapterList.map((chapter: any, i: number) => (
                    <Link to={`${i}/highlights`}>
                        <li key={chapter.id} className={"sr-chapter tree-item-self is-clickable"}>
                            <div className={"tree-item-inner"}>
                                {chapter.title}
                            </div>
                            <div className={"test-coverage tree-item-flair-outer"}>
                                <span>
                                    <span className={"no-tests tree-item-flair sr-test-counts"}
                                          aria-label={"Cards without tests"}>
                                        {chapter.chapterNotesWithTests}
                                    </span>
                                    <span className={"have-tests tree-item-flair sr-test-counts"}
                                          aria-label={"Cards with tests"}>
                                        {chapter.chapterNotesWithoutTests}
                                    </span>
                                </span>
                            </div>
                        </li>
                    </Link>
                ))}
            </ul>
        </>
    );
}