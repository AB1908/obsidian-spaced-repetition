import React from "react";
import {Link} from "react-router-dom";
import {Deck} from "src/Deck";
import {routes} from "src/ui/modals/flashcard-modal";
import {HeaderWithCounts} from "src/ui/components/highlights";

export function ChapterList() {
    const deck1 = {
        deckName: "Deck1",
        chapters: [
            {id: 1, title: "Chapter 1", notesWithoutTests: 20, notesWithTests: 11},
            {id: 2, title: "Chapter 2", notesWithoutTests: 12, notesWithTests: 15},
        ]
    };
    const chapterList = deck1.chapters;
    return (
        <>
            <h3>
                {deck1.deckName}
            </h3>
            <HeaderWithCounts
                withoutCount={chapterList.reduce((accumulator, currentValue) => accumulator + currentValue.notesWithoutTests, 0)}
                withCount={chapterList.reduce((accumulator, currentValue) => accumulator + currentValue.notesWithTests, 0)}
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