import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { annotation } from "src/data/models/annotations";
import { CategoryConfig } from "src/config/annotation-categories";
import { setIcon } from "src/infrastructure/obsidian-facade";

interface ProcessedAnnotationRowProps {
    annotation: annotation;
    baseLinkPath: string;
    categories: CategoryConfig[];
}

export function ProcessedAnnotationRow(props: ProcessedAnnotationRowProps) {
    const iconRef = useRef<HTMLDivElement>(null);
    const categoryConfig = props.categories.find((category) => category.name === props.annotation.category) ?? null;

    useEffect(() => {
        if (iconRef.current && categoryConfig) {
            setIcon(iconRef.current, categoryConfig.icon);
        }
    }, [categoryConfig]);

    return (
        <div id={props.annotation.id}>
            <Link
                to={`${props.annotation.id}/${props.baseLinkPath}`}
                state={{ scrollId: props.annotation.id }}
                onClick={() => sessionStorage.setItem("scrollToAnnotation", props.annotation.id)}
            >
                <li
                    className={"sr-highlight tree-item-self is-clickable"}
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                >
                    {categoryConfig ? (
                        <div
                            ref={iconRef}
                            data-testid="annotation-category-icon"
                            style={{ width: "16px", height: "16px", flexShrink: 0 }}
                        />
                    ) : (
                        <div
                            data-testid="annotation-category-placeholder"
                            style={{
                                width: "16px",
                                height: "16px",
                                flexShrink: 0,
                                backgroundColor: "var(--text-muted)",
                                borderRadius: "2px",
                                opacity: 0.4,
                            }}
                        />
                    )}
                    <span className={"sr-annotation-text"} style={{ flexGrow: 1 }}>
                        {props.annotation.highlight}
                    </span>
                    {props.annotation.flashcardCount ? (
                        <span className={"no-tests tree-item-flair sr-test-counts"} style={{ opacity: 0.8 }}>
                            {props.annotation.flashcardCount}
                        </span>
                    ) : null}
                </li>
            </Link>
        </div>
    );
}
