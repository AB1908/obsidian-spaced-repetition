import React from "react";
import {Link} from "react-router-dom";
import {AllCardCounts} from "src/ui/components/card-counts";
import {Deck} from "src/Deck";

// export function ChapterList({chapterList}: { chapterList: any }) {
export function ChapterList() {
    //TODO: add logic to emit book object when clicked
    const chapterList = [
        {id: 1, title: "Chapter 1", notesWithoutTests: 20, notesWithTests: 11},
        {id: 2, title: "Chapter 2", notesWithoutTests: 12, notesWithTests: 15},
    ];
    const deck1 = {dueFlashcardsCount: 10, newFlashcardsCount:20, totalFlashcards: 30, deckName: "Deck1"} as Deck;
    return (
        <>
            <h3>
                {deck1.deckName}
            </h3>
            <h4>
                <AllCardCounts deck={deck1}/>
            </h4>
            <p>Add flashcards from:</p>
            <ul className={"sr-chapter-tree"}>
                {chapterList.map((chapter: any) => (
                    <Link to={"/notes/deck/chapters/1"}>
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