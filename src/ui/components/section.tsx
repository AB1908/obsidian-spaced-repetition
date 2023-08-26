// TODO: extract spans
// TODO: add labels
import {book} from "src/data/models/book";
import {Link} from "react-router-dom";
import React from "react";

export function Section({section}: { section: book }) {
    // const clickHandler = () => console.log("Clicked!");
    const sectionId: string = section.id;
    return <Link to={`${sectionId}/annotations`}>
        <div className="sr-deck tree-item-inner">
            {section.name}
            <span>
                {/*TODO: look into changing these class names? These ugly yo*/}
                <span className={"yes-tests tree-item-flair sr-test-counts"}>
                    {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                    {section.count.with}
                </span>
                <span className={"no-tests tree-item-flair sr-test-counts"}>
                    {/*// TODO: potential for this to be null since spec for flashcard array not defined yet*/}
                    {/*{section.with}*/}
                    {section.count.without}
                </span>
            </span>
        </div>
    </Link>;
}