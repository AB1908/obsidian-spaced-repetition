import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { annotation, SectionAnnotations } from "src/data/models/annotations";
import { getFilteredAnnotations } from "src/utils/annotation-filters";
import { integerToRGBA } from "src/utils/utils";
import { CategoryFilter } from "src/ui/components/category-filter";
import { ANNOTATION_CATEGORY_ICONS } from "src/config/annotation-categories";

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
    filter: 'unprocessed' | 'processed' | 'all';
    setFilter: (filter: 'unprocessed' | 'processed' | 'all') => void;
    activeColorFilter: string | null;
    setActiveColorFilter: (color: string | null) => void;
}

const NAVIGATION_FILTER_SESSION_KEY = "annotationNavigationFilter";

export function AnnotationDisplayList(props: AnnotationDisplayListProps) {
    const { chapterData, baseLinkPath, filter, setFilter, activeColorFilter, setActiveColorFilter } = props;
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<number | null>(null);

    // todo: why do we use useMemo here? Seems unnecessary especially when we have a direct API and things are all local.
    // we don't need to cache anything, so consider removing
    // check what tradeoffs this incurs in terms of development as well as for user experience at scale
    const displayedAnnotations = useMemo(() => {
        return getFilteredAnnotations(chapterData.annotations, filter, activeCategoryFilter, activeColorFilter);
    }, [filter, activeCategoryFilter, activeColorFilter, chapterData.annotations]);

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
    }, [filter]);

    useEffect(() => {
        sessionStorage.setItem(
            NAVIGATION_FILTER_SESSION_KEY,
            JSON.stringify({
                mainFilter: filter,
                categoryFilter: activeCategoryFilter,
                colorFilter: activeColorFilter
            })
        );
    }, [filter, activeCategoryFilter, activeColorFilter]);

    return (
        <>
            <h3>
                {chapterData.title}
            </h3>

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

            <div style={{ marginBottom: '1rem' }}>
                {filter === 'processed' && (
                    <CategoryFilter
                        selectedCategory={activeCategoryFilter}
                        onCategorySelect={setActiveCategoryFilter}
                    />
                )}
                {filter === 'unprocessed' && (
                    <ColorFilter
                        annotations={chapterData.annotations}
                        selectedColor={activeColorFilter}
                        onColorSelect={setActiveColorFilter}
                    />
                )}
            </div>

            <ul className={"sr-highlight-tree"}>
                {displayedAnnotations.map((annotation: annotation) => (
                    <AnnotationListItem key={annotation.id} annotation={annotation} baseLinkPath={baseLinkPath} />
                ))}
            </ul>
        </>
    );
}
