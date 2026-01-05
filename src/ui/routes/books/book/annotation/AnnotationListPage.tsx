import React from "react";
import { useLoaderData, useLocation } from "react-router-dom";
import { AnnotationDisplayList } from "src/ui/components/annotation-display-list";
import { SectionAnnotations } from "src/data/models/annotations";
import { USE_JSON_MOCK } from "src/ui/routes/books/review";
import { getAnnotationsForSection } from "src/api";

export interface AnnotationsLoaderParams {
    bookId: string;
    sectionId: string;
}

export function annotationsLoader({params}: {params: AnnotationsLoaderParams}) {
    if (!USE_JSON_MOCK)
        return getAnnotationsForSection(params.sectionId, params.bookId);
    else
        return fetch(`http://localhost:3000/annotations?chapterId=${params.sectionId}`);
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

export function AnnotationListPage() {
    const chapterData = useLoaderData() as SectionAnnotations;
    const location = useLocation();
    
    const isImportFlow = location.pathname.includes("/import/");
    const [filter, setFilter] = React.useState<'unprocessed' | 'processed' | 'all'>(isImportFlow ? 'unprocessed' : 'processed');
    const [activeColorFilter, setActiveColorFilter] = React.useState<string | null>(null);

    const baseLinkPath = isImportFlow ? "personal-note" : "flashcards";

    return (
        <AnnotationDisplayList
            chapterData={chapterData}
            baseLinkPath={baseLinkPath}
            filter={filter}
            setFilter={setFilter}
            activeColorFilter={activeColorFilter}
            setActiveColorFilter={setActiveColorFilter}
        />
    );
}
