import React from "react";
import { useLoaderData } from "react-router-dom";
import { annotation, SectionAnnotations } from "src/data/models/annotations";
import { USE_ACTUAL_BACKEND } from "src/routes/review";
import { getAnnotationsForSection } from "src/api";
import { AnnotationDisplayList } from "./annotation-display-list";

export interface AnnotationsLoaderParams {
    bookId: string;
    sectionId: string;
}

export function annotationsLoader({params}: {params: AnnotationsLoaderParams}) {
    if (USE_ACTUAL_BACKEND)
        return getAnnotationsForSection(params.sectionId, params.bookId);
    else
        return fetch(`http://localhost:3000/annotationsBySection/${params.sectionId}`);
}

export function HeaderWithCounts(props: { withoutCount: number, withCount: number }) {
    return (
        <h4>
            <span
                className={"no-tests tree-item-flair sr-test-counts"}
                aria-label={"Cards without tests"}
            >
                {props.withoutCount}
            </span>
            <span
                className={"no-tests tree-item-flair sr-test-counts"}
                aria-label={"Cards without tests"}
            >
                {props.withCount}
            </span>
        </h4>
    );
}

export function ImportHighlights() {
    const chapterData = useLoaderData() as SectionAnnotations;
    const [filter, setFilter] = React.useState<'uncategorized' | 'all'>('uncategorized');

    return (
        <AnnotationDisplayList
            chapterData={chapterData}
            baseLinkPath="personal-note"
            filter={filter}
            setFilter={setFilter}
        />
    );
}
