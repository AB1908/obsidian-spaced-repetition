import React from "react";
import { Link, useLocation } from "react-router-dom";
import { getFilteredAnnotations } from "src/utils/annotation-filters";
import { annotation, SectionAnnotations } from "src/data/models/annotations";

interface AnnotationListItemProps {
    annotation: annotation;
    baseLinkPath: string;
}

function AnnotationListItem(props: AnnotationListItemProps) {
    return (
        <div id={props.annotation.id}>
            <Link
                to={`${props.annotation.id}/${props.baseLinkPath}`}
                state={{ scrollId: props.annotation.id }}
                onClick={() => sessionStorage.setItem('scrollToAnnotation', props.annotation.id)}
            >
                <li className={"sr-highlight tree-item-self is-clickable"}>
                    <span className={"sr-annotation-text"}>
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

    const displayedAnnotations = React.useMemo(() => {
        return getFilteredAnnotations(chapterData.annotations, filter);
    }, [filter, chapterData.annotations]);

    React.useEffect(() => {
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

    return (
        <>
            <h3>
                {chapterData.title}
            </h3>

            <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem' }}>
                <button
                    className={`mod-cta ${filter === 'uncategorized' ? '' : 'mod-muted'}`}
                    onClick={() => setFilter('uncategorized')}
                >
                    To Process
                </button>
                <button
                    className={`mod-cta ${filter === 'all' ? '' : 'mod-muted'}`}
                    onClick={() => setFilter('all')}
                >
                    All
                </button>
            </div>

            <ul className={"sr-highlight-tree"}>
                {displayedAnnotations.map((annotation: annotation) => (
                    <AnnotationListItem key={annotation.id} annotation={annotation} baseLinkPath={baseLinkPath} />
                ))}
            </ul>
        </>
    );
}
