import React from "react";
import {HeaderWithCounts} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";
import {book} from "src/data/models/book";
import {Tree} from "src/ui/components/tree";
import {Link} from "react-router-dom";

// TODO: more realistic data
// TODO: think of a better data structure for this, this is terrible
export function chapterLoader({params}: {params: any}) {
    return fetch(`http://localhost:3000/books/${params.bookId}`);
}

// TODO: extract spans
// TODO: add labels
function Section({section, counts}: { section: book, counts: Counts }) {
    // const clickHandler = () => console.log("Clicked!");
    return <Link to={`${section.id}/annotations`}>
        <div className="sr-deck tree-item-inner">
        {section.name}
            <span>
                {/*TODO: look into changing these class names? These ugly yo*/}
                <span className={"yes-tests tree-item-flair sr-test-counts"}>
                    {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                    {counts[section.id].with}
                </span>
                <span className={"no-tests tree-item-flair sr-test-counts"}>
                    {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                    {/*{section.with}*/}
                    {counts[section.id].without}
                </span>
            </span>
        </div>
    </Link>;
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

            <Tree data={deck1} apply={null} render={(child) => <Section section={child} counts={counts}/>} childKey={"children"}/>
        </>
    );
}