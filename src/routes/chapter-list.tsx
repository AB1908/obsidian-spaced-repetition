import React from "react";
import { useLoaderData } from "react-router";
import type { Heading, book } from "src/data/models/sourceNote";
import { Tree } from "src/ui/components/tree";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getSectionTreeForBook } from "src/api";
import { Section } from "src/ui/components/section";

export interface ChapterLoaderParams {
    bookId: string;
}

// DONE: more realistic data
// DONE: think of a better data structure for this, this is terrible
export function chapterLoader({ params }: { params: ChapterLoaderParams }) {
    if (USE_ACTUAL_BACKEND) {
        return getSectionTreeForBook(params.bookId);
    } else {
        return fetch(`http://localhost:3000/bookTree/${params.bookId}`);
    }
}

// DONE: Fix counts for header
// DONE: Fix state changes when clicking?
// DONE: Actually allow clicking?
export function ChapterList() {
    const book: book = useLoaderData() as book;
    return (
        <>
            <p>Add flashcards from:</p>
            <div className={"chapter-tree"}>
                <Tree data={book} render={(child: Heading) => <Section section={child} />} />
            </div>
        </>
    );
}