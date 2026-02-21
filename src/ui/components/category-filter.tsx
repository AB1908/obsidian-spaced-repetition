import React, { useEffect, useRef } from "react";
import { setIcon } from "src/infrastructure/obsidian-facade";
import type { CategoryConfig } from "src/config/annotation-categories";

interface CategoryFilterProps {
    categories: CategoryConfig[];
    selectedCategory: string | null;
    onCategorySelect: (category: string | null) => void;
}

export function CategoryFilter({
    categories,
    selectedCategory,
    onCategorySelect,
}: CategoryFilterProps) {
    const iconRefs = useRef<Array<HTMLDivElement | null>>([]);

    useEffect(() => {
        categories.forEach((category, i) => {
            const iconRef = iconRefs.current[i];
            if (iconRef) {
                setIcon(iconRef, category.icon);
            }
        });
    }, [categories]);

    const handleCategoryClick = (categoryName: string) => {
        if (selectedCategory === categoryName) {
            onCategorySelect(null);
        } else {
            onCategorySelect(categoryName);
        }
    };

    return (
        <div className="sr-category-buttons" style={{ display: "flex", gap: "0.5rem" }}>
            {categories.map((category, i) => (
                <div
                    key={category.name}
                    className={`sr-category-button is-clickable ${selectedCategory === category.name ? "is-active" : ""}`}
                    onClick={() => handleCategoryClick(category.name)}
                    style={{
                        padding: "8px",
                        border: "1px solid",
                        borderColor: selectedCategory === category.name ? "var(--interactive-accent)" : "var(--background-modifier-border)",
                        borderRadius: "4px",
                        backgroundColor: selectedCategory === category.name ? "var(--background-modifier-hover)" : "transparent"
                    }}
                >
                    <div ref={(element) => { iconRefs.current[i] = element; }} />
                </div>
            ))}
        </div>
    );
}
