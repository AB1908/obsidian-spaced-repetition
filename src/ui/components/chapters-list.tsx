import React from "react";
import {HeaderWithCounts} from "src/ui/components/highlights";
import {useLoaderData} from "react-router";
import {book, deck} from "src/data/models/book";
import {Tree} from "src/ui/components/tree";

// TODO: more realistic data
// TODO: think of a better data structure for this, this is terrible
export function chapterLoader() {
    return {
        id: "alksdfj9",
        name: "Book 1",
        children: [
            {
                name: "Header 1",
                id: "-g4c-q2S",
                children: [
                    {
                        name: "SubHeader 1",
                        id: "xHev-sAx",
                        children: [],
                    },
                    {
                        name: "SubHeader 2",
                        id: "xHev-sA1",
                        children: [],
                    },
                ],
            },
            {
                name: "Header 2",
                id: "eLy47ZoN",
                children: [ ],
            },
            {
                name: "Last header",
                heading: "Last header",
                id: "WVcwnuIQ",
                children: [
                    {
                        name: "Last subheader",
                        heading: "Last subheader",
                        id: "WVc23uIQ",
                        children: [
                        ],
                    },
                ],
            },
        ],
        counts: {
            "-g4c-q2S": {
                "with": 1,
                "without": 2,
            },
            "WVc23uIQ": {
                "with": 0,
                "without": 1,
            },
            "WVcwnuIQ": {
                "with": 1,
                "without": 1,
            },
            "alksdfj9": {
                "with": 2,
                "without": 4,
            },
            "eLy47ZoN": {
                "with": 0,
                "without": 1,
            },
            "xHev-sA1": {
                "with": 0,
                "without": 1,
            },
            "xHev-sAx": {
                "with": 0,
                "without": 1,
            },
        }
    };
}

// TODO: extract spans
// TODO: add labels
function Section({section, counts}: { section: any, counts: any }) {
    const clickHandler = () => console.log("Clicked!");
    return <div className="sr-deck tree-item-inner" onClick={clickHandler}>
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
    </div>;
}

// TODO: Fix counts for header
// TODO: Fix state changes when clicking?
// TODO: Actually allow clicking?
export function ChapterList() {
    const deck1: book = useLoaderData() as book;
    // @ts-ignore
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