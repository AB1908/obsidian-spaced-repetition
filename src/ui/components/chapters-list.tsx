import React from "react";
import {HeaderWithCounts} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";
import {Book, deck} from "src/data/models/book";
import {Tree} from "src/ui/components/tree";

export function chapterLoader() {
    return deck();
}

function TreeItem({section}:{section: any}) {
    if (section.hasOwnProperty("title"))
        return <div className="sr-deck tree-item-inner" >
            {section.title}
        </div>;
    else if (section.hasOwnProperty("highlight"))
        return <div className="sr-deck tree-item-inner" >
            {section.highlight}
        </div>;
    else console.log("lol")
}

// TODO: Fix counts
// TODO: Fix state changes when clicking?
// TODO: Actually allow clicking?
export function ChapterList() {
    const deck1: Book = useLoaderData() as Book;
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

            <Tree data={deck1} apply={null} render={(child) => <TreeItem section={child}/>} childKey={"sections"}/>
        </>
    );
}