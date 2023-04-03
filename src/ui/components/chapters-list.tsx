import React from "react";

export function ChapterList({chapterList}: { chapterList: any }) {
    //TODO: add logic to emit book object when clicked
    return (<>
            <p>Add flashcards from:</p>
            <ul>
                {chapterList.map((chapter: any) => (<li key={chapter.id}>
                    {chapter.title}
                </li>))}
            </ul>
        </>
    );
}
