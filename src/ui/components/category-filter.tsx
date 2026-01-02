import React, { useEffect, useRef } from "react";
import { setIcon } from "src/infrastructure/obsidian-facade";
import { ANNOTATION_CATEGORY_ICONS } from "src/config/annotation-categories";
import { Icon } from "src/types/obsidian-icons";

interface CategoryFilterProps {
    selectedCategory: number | null;
    onCategorySelect: (category: number | null) => void;
}

export function CategoryFilter({ selectedCategory, onCategorySelect }: CategoryFilterProps) {
    const iconRefs = ANNOTATION_CATEGORY_ICONS.map(() => useRef<HTMLDivElement>(null));
    const clearFilterRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        ANNOTATION_CATEGORY_ICONS.forEach((iconName, i) => {
            if (iconRefs[i].current) {
                setIcon(iconRefs[i].current, iconName);
            }
        });
        if (clearFilterRef.current) {
            setIcon(clearFilterRef.current, "circle-slash"); // Icon for clearing the filter
        }
    }, []);

    return (
        <div className="sr-category-buttons" style={{ display: "flex", gap: "0.5rem" }}>
            {ANNOTATION_CATEGORY_ICONS.map((_, i) => (
                <div
                    key={i}
                    className={`sr-category-button is-clickable ${selectedCategory === i ? "is-active" : ""}`}
                    onClick={() => onCategorySelect(i)}
                    style={{
                        padding: "8px",
                        border: "1px solid",
                        borderColor: selectedCategory === i ? "var(--interactive-accent)" : "var(--background-modifier-border)",
                        borderRadius: "4px",
                        backgroundColor: selectedCategory === i ? "var(--background-modifier-hover)" : "transparent"
                    }}
                >
                    <div ref={iconRefs[i]} />
                </div>
            ))}
            <div
                className={`sr-category-button is-clickable ${selectedCategory === null ? "is-active" : ""}`}
                onClick={() => onCategorySelect(null)}
                style={{
                    padding: "8px",
                    border: "1px solid",
                    borderColor: selectedCategory === null ? "var(--interactive-accent)" : "var(--background-modifier-border)",
                    borderRadius: "4px",
                    backgroundColor: selectedCategory === null ? "var(--background-modifier-hover)" : "transparent"
                }}
                title="Clear category filter"
            >
                <div ref={clearFilterRef} />
            </div>
        </div>
    );
}
