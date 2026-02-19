import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { annotation, SectionAnnotations } from "src/data/models/annotations";
import { getFilteredAnnotations } from "src/utils/annotation-filters";
import { integerToRGBA } from "src/utils/utils";
import { CategoryFilter } from "src/ui/components/category-filter";
import { ANNOTATION_CATEGORY_ICONS } from "src/config/annotation-categories";
import {
    AnnotationListViewPolicy,
    AnnotationMainFilter,
} from "src/data/models/sourceCapabilities";

interface AnnotationListItemProps {
    annotation: annotation;
    baseLinkPath: string;
}

function AnnotationListItem(props: AnnotationListItemProps) {
    const highlightColor = useMemo(() => {
        if (props.annotation.originalColor) {
            return integerToRGBA(props.annotation.originalColor);
        }
        return null;
    }, [props.annotation.originalColor]);

    return (
        <div id={props.annotation.id}>
            <Link
                to={`${props.annotation.id}/${props.baseLinkPath}`}
                state={{ scrollId: props.annotation.id }}
                onClick={() => sessionStorage.setItem('scrollToAnnotation', props.annotation.id)}
            >
                <li className={"sr-highlight tree-item-self is-clickable"} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {highlightColor && (
                        <div
                            style={{
                                width: "12px",
                                height: "12px",
                                backgroundColor: highlightColor,
                                border: "1px solid var(--background-modifier-border)",
                                borderRadius: "2px",
                                flexShrink: 0
                            }}
                        />
                    )}
                    <span className={"sr-annotation-text"} style={{ flexGrow: 1 }}>
                        {props.annotation.highlight}
                    </span>
                    {props.annotation.flashcardCount &&
                        <span>
                            <span className={"no-tests tree-item-flair sr-test-counts"}>
                                {props.annotation.flashcardCount}
                            </span>
                        </span>
                    }
                </li>
            </Link>
        </div>
    );
}

import { ColorFilter } from "src/ui/components/ColorFilter";

interface AnnotationDisplayListProps {
    chapterData: SectionAnnotations;
    baseLinkPath: string;
    filter: AnnotationMainFilter;
    setFilter: (filter: AnnotationMainFilter) => void;
    activeColorFilter: string | null;
    setActiveColorFilter: (color: string | null) => void;
    viewPolicy: AnnotationListViewPolicy;
}

const NAVIGATION_FILTER_SESSION_KEY = "annotationNavigationFilter";

export function AnnotationDisplayList(props: AnnotationDisplayListProps) {
    const {
        chapterData,
        baseLinkPath,
        filter,
        setFilter,
        activeColorFilter,
        setActiveColorFilter,
        viewPolicy,
    } = props;
    const effectiveFilter = viewPolicy.enforcedMainFilter ?? filter;
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<number | null>(null);

    // todo: why do we use useMemo here? Seems unnecessary especially when we have a direct API and things are all local.
    // we don't need to cache anything, so consider removing
    // check what tradeoffs this incurs in terms of development as well as for user experience at scale
    const displayedAnnotations = useMemo(() => {
        return getFilteredAnnotations(chapterData.annotations, effectiveFilter, activeCategoryFilter, activeColorFilter);
    }, [effectiveFilter, activeCategoryFilter, activeColorFilter, chapterData.annotations]);

    //todo: don't use direct DOM manipulation one day
    useEffect(() => {
        const scrollId = sessionStorage.getItem('scrollToAnnotation');
        if (scrollId) {
            const element = document.getElementById(scrollId);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.classList.add('sr-annotation-highlighted');
                setTimeout(() => {
                    element.classList.remove('sr-annotation-highlighted');
                }, 1500);
            }
            sessionStorage.removeItem('scrollToAnnotation');
        }
    }, [chapterData]);

    // Reset sub-filters when main filter changes
    useEffect(() => {
        setActiveCategoryFilter(null);
        setActiveColorFilter(null);
    }, [effectiveFilter]);

    useEffect(() => {
        sessionStorage.setItem(
            NAVIGATION_FILTER_SESSION_KEY,
            JSON.stringify({
                mainFilter: effectiveFilter,
                categoryFilter: activeCategoryFilter,
                colorFilter: activeColorFilter
            })
        );
    }, [effectiveFilter, activeCategoryFilter, activeColorFilter]);

    return (
        <>
            <h3>
                {chapterData.title}
            </h3>

            {viewPolicy.showMainFilterButtons && (
                <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`mod-cta ${filter === 'unprocessed' ? '' : 'mod-muted'}`}
                        onClick={() => setFilter('unprocessed')}
                    >
                        Unprocessed
                    </button>
                    <button
                        className={`mod-cta ${filter === 'processed' ? '' : 'mod-muted'}`}
                        onClick={() => setFilter('processed')}
                    >
                        Processed
                    </button>
                    <button
                        className={`mod-cta ${filter === 'all' ? '' : 'mod-muted'}`}
                        onClick={() => setFilter('all')}
                    >
                        All
                    </button>
                </div>
            )}

            {(viewPolicy.showCategoryFilter || viewPolicy.showColorFilter) && (
                <div style={{ marginBottom: '1rem' }}>
                    {viewPolicy.showCategoryFilter && effectiveFilter === 'processed' && (
                        <CategoryFilter
                            selectedCategory={activeCategoryFilter}
                            onCategorySelect={setActiveCategoryFilter}
                        />
                    )}
                    {viewPolicy.showColorFilter && effectiveFilter === 'unprocessed' && (
                        <ColorFilter
                            annotations={chapterData.annotations}
                            selectedColor={activeColorFilter}
                            onColorSelect={setActiveColorFilter}
                        />
                    )}
                </div>
            )}

            <ul className={"sr-highlight-tree"}>
                {displayedAnnotations.map((annotation: annotation) => (
                    <AnnotationListItem key={annotation.id} annotation={annotation} baseLinkPath={baseLinkPath} />
                ))}
            </ul>
        </>
    );
}
