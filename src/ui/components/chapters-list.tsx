import React from "react";
import {Link} from "react-router-dom";

// export function ChapterList({chapterList}: { chapterList: any }) {
export function ChapterList() {
    //TODO: add logic to emit book object when clicked
    const chapterList = [
            { id: 1, title: "Chapter 1", notesWithoutTests: 20, notesWithTests: 11 },
            { id: 2, title: "Chapter 2", notesWithoutTests: 12, notesWithTests: 15 },
    ];
    return (
        <>
            <p>Add flashcards from:</p>
            <ul>
                {chapterList.map((chapter: any) => (
                    <Link to={""}>
                        <li key={chapter.id}>
                        {chapter.title}
                        <div className={"test-coverage"}>
                            <span>
                                {chapter.notesWithoutTests}
                            </span>
                            <span>
                                {chapter.notesWithTests}
                            </span>
                        </div>
                    </li>
                    </Link>
                ))}
            </ul>
        </>
    );
}
