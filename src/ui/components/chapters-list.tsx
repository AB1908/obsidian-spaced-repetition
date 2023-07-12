import React from "react";
import {HeaderWithCounts} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";
import {book, deck} from "src/data/models/book";
import {Tree} from "src/ui/components/tree";

export function chapterLoader() {
    return deck();
}

// TODO: extract spans
// TODO: add labels
function Section({section}: { section: any }) {
    const clickHandler = () => console.log("Clicked!");
    return <div className="sr-deck tree-item-inner" onClick={clickHandler}>
        {section.title}
        <span>
            <span className={"no-tests tree-item-flair sr-test-counts"}>
                {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                {section.without}
            </span>
            <span className={"no-tests tree-item-flair sr-test-counts"}>
                {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                {section.with}
            </span>
        </span>
    </div>;
}

// TODO: Fix counts for header
// TODO: Fix state changes when clicking?
// TODO: Actually allow clicking?
export function ChapterList() {
    const deck1: book = useLoaderData() as book;
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

            <Tree data={deck1} apply={null} render={(child) => <Section section={child}/>} childKey={"sections"}/>
        </>
    );
}