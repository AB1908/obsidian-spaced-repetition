// TODO: extract spans
// TODO: add labels
import {book} from "src/data/models/book";
import {Link} from "react-router-dom";
import React from "react";

export function Section({section}: { section: book }) {
    const sectionId: string = section.id;
    return <Link to={`${sectionId}/annotations`}>
        <div className="sr-deck tree-item-inner">
            {section.name}
            <span>
                {/*TODO: look into changing these class names? These ugly yo*/}
                <span className={"yes-tests tree-item-flair sr-test-counts"}>
                    {section.counts.with}
                </span>
                <span className={"no-tests tree-item-flair sr-test-counts"}>
                    {section.counts.without}
                </span>
            </span>
        </div>
    </Link>;
}