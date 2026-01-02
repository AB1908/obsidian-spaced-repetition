import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { annotation, SectionAnnotations } from "src/data/models/annotations";
import { getFilteredAnnotations } from "src/utils/annotation-filters";
import { integerToRGBA } from "src/utils";
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
                    <span>
                        <span className={"no-tests tree-item-flair sr-test-counts"}>
                            {props.annotation.flashcardCount}
                        </span>
                    </span>
                </li>
            </Link>
        </div>
    );
}

interface AnnotationDisplayListProps {
    chapterData: SectionAnnotations;
    baseLinkPath: string;
    filter: 'uncategorized' | 'all';
    setFilter: (filter: 'uncategorized' | 'all') => void;
}

export function AnnotationDisplayList(props: AnnotationDisplayListProps) {
    const { chapterData, baseLinkPath, filter, setFilter } = props;
    const [activeCategoryFilter, setActiveCategoryFilter] = useState<number | null>(null);

    const displayedAnnotations = useMemo(() => {
        return getFilteredAnnotations(chapterData.annotations, filter, activeCategoryFilter);
    }, [filter, activeCategoryFilter, chapterData.annotations]);

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

    // Reset activeCategoryFilter when main filter changes from 'all'
    useEffect(() => {
        if (filter !== 'all' && activeCategoryFilter !== null) {
            setActiveCategoryFilter(null);
        }
    }, [filter]);

    return (
        <>
            <h3>
                {chapterData.title}
            </h3>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    className={`mod-cta ${filter === 'uncategorized' ? '' : 'mod-muted'}`}
                    onClick={() => {
                        setFilter('uncategorized');
                        setActiveCategoryFilter(null); // Clear category filter when switching to 'To Process'
                    }}
                >
                    To Process
                </button>
                <button
                    className={`mod-cta ${filter === 'all' ? '' : 'mod-muted'}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
                {filter === 'all' && (
                    <CategoryFilter
                        selectedCategory={activeCategoryFilter}
                        onCategorySelect={setActiveCategoryFilter}
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
