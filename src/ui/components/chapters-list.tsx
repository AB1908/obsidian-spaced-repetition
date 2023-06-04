import React from "react";
import {Link} from "react-router-dom";
import {routes} from "src/ui/modals/flashcard-modal";
import {HeaderWithCounts} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";

export function chapterLoader() {
    const deck1 = {
        deckName: "Deck1",
        chapters: [
            {id: 1, title: "Chapter 1", notesWithoutTests: 20, notesWithTests: 11},
            {id: 2, title: "Chapter 2", notesWithoutTests: 12, notesWithTests: 15},
        ]
    };
    return deck1;
}

export function countKeyInArray(key: string, array: any) {
    return array.reduce((accumulator: number, currentValue: any) => accumulator + currentValue[key], 0);
}

export function ChapterList() {
    const deck1 = useLoaderData();
    const chapterList = deck1.chapters;
    const highlightsWithoutTests = countKeyInArray("notesWithoutTests", chapterList);
    const highlightsWithTests = countKeyInArray("notesWithTests", chapterList);
    return (
        <>
            <h3>
                {deck1.deckName}
            </h3>
            <HeaderWithCounts
                withoutCount={highlightsWithoutTests}
                withCount={highlightsWithTests}
            />
            <p>Add flashcards from:</p>
            <ul className={"sr-chapter-tree"}>
                {chapterList.map((chapter: any) => (
                    <Link to={routes.highlightList}>
                        <li key={chapter.id} className={"sr-chapter tree-item-self is-clickable"}>
                            <div className={"tree-item-inner"}>
                                {chapter.title}
                            </div>
                            <div className={"test-coverage tree-item-flair-outer"}>
                                <span>
                                    <span className={"no-tests tree-item-flair sr-test-counts"}
                                          aria-label={"Cards without tests"}>
                                        {chapter.notesWithoutTests}
                                    </span>
                                    <span className={"have-tests tree-item-flair sr-test-counts"}
                                          aria-label={"Cards with tests"}>
                                        {chapter.notesWithTests}
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