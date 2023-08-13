import React from "react";
import {HeaderWithCounts} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";
import {book} from "src/data/models/book";
import {Tree} from "src/ui/components/tree";
import {USE_ACTUAL_BACKEND} from "src/routes/review";
import {getSectionTreeForBook} from "src/controller";
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
    const deck1: book = useLoaderData() as book;
    const {counts} = deck1;
    return (
        <>
            <h3>
                {deck1.name}
            </h3>
            <HeaderWithCounts
                withCount={9}
                withoutCount={10}
            />
            <p>Add flashcards from:</p>

            <Tree data={deck1} render={(child) => <Section section={child} counts={counts}/>} childKey={"children"}/>
        </>
    );
}