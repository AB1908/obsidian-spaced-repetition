import { Icon } from "src/types/obsidian-icons";

export interface CategoryConfig {
    name: string;
    icon: Icon;
}

export const DEFAULT_ANNOTATION_CATEGORIES: CategoryConfig[] = [
    { name: "insight", icon: "lightbulb" },
    { name: "quote", icon: "quote" },
    { name: "vocabulary", icon: "whole-word" },
    { name: "note", icon: "sticky-note" },
    { name: "important", icon: "star" },
    { name: "other", icon: "asterisk" },
];

export function resolveAnnotationCategories(
    categories?: CategoryConfig[] | null
): CategoryConfig[] {
    if (!categories || categories.length === 0) {
        return DEFAULT_ANNOTATION_CATEGORIES;
    }
    return categories.filter((category) => category.name && category.icon);
}
