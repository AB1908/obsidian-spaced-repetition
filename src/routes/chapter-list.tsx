import React from "react";
import {useLoaderData} from "react-router";
import {book} from "src/data/models/book";
import {Tree} from "src/ui/components/tree";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getSectionTreeForBook} from "src/api";
import {Section} from "src/ui/components/section";

// TODO: more realistic data
// TODO: think of a better data structure for this, this is terrible
export function chapterLoader({params}: {params: any}) {
    if (USE_ACTUAL_BACKEND) {
        return getSectionTreeForBook(params.bookId);
    } else {
        return fetch(`http://localhost:3000/bookTree/${params.bookId}`);
    }
}

// TODO: Fix counts for header
// TODO: Fix state changes when clicking?
// TODO: Actually allow clicking?
export function ChapterList() {
    const book: book = useLoaderData() as book;
    return (
        <>
            <p>Add flashcards from:</p>

            <Tree data={book} render={(child) => <Section section={child}/>} childKey={"children"}/>
        </>
    );
}