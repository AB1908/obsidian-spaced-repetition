import { Icon } from "src/types/obsidian-icons";

export interface CategoryConfig {
    name: string;
    icon: Icon;
}

export type CategoryListResult = CategoryConfig[] | { error: string };

export const DEFAULT_ANNOTATION_CATEGORIES: CategoryConfig[] = [
    { name: "insight", icon: "lightbulb" },
    { name: "quote", icon: "quote" },
    { name: "vocabulary", icon: "whole-word" },
    { name: "note", icon: "sticky-note" },
    { name: "important", icon: "star" },
    { name: "other", icon: "asterisk" },
];

export const CURATED_CATEGORY_ICONS: Icon[] = [
    "lightbulb",
    "quote",
    "whole-word" as Icon,
    "sticky-note" as Icon,
    "star",
    "asterisk",
    "bookmark",
    "tag",
    "flag",
    "heart",
    "zap",
    "flame",
    "trophy" as Icon,
    "target",
    "puzzle" as Icon,
    "brain" as Icon,
    "coffee",
    "pencil" as Icon,
    "eye",
    "search" as Icon,
    "link" as Icon,
    "check-circle",
    "alert-circle",
    "help-circle",
    "info" as Icon,
    "compass",
    "map",
    "layers",
    "code",
    "music",
];

function normalizeCategoryName(name: string | undefined): string {
    return (name ?? "").trim();
}

function hasDuplicateName(categories: CategoryConfig[], candidateName: string, ignoreName?: string): boolean {
    return categories.some((category) => {
        if (ignoreName && category.name === ignoreName) {
            return false;
        }
        return category.name === candidateName;
    });
}

export function addCategoryToList(
    categories: CategoryConfig[],
    newCategory: CategoryConfig
): CategoryListResult {
    const name = normalizeCategoryName(newCategory.name);
    const icon = newCategory.icon;

    if (!name) {
        return { error: "Category name is required." };
    }
    if (!icon) {
        return { error: "Category icon is required." };
    }
    if (hasDuplicateName(categories, name)) {
        return { error: "Category name already exists." };
    }

    return [...categories, { name, icon }];
}

export function removeCategoryFromList(categories: CategoryConfig[], name: string): CategoryConfig[] {
    const next = categories.filter((category) => category.name !== name);
    return next.length === categories.length ? categories : next;
}

export function reorderCategoryInList(
    categories: CategoryConfig[],
    name: string,
    direction: "up" | "down"
): CategoryConfig[] {
    const index = categories.findIndex((category) => category.name === name);
    if (index === -1) {
        return categories;
    }

    const swapIndex = direction === "up" ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= categories.length) {
        return categories;
    }

    const next = [...categories];
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
    return next;
}

export function editCategoryInList(
    categories: CategoryConfig[],
    oldName: string,
    updates: Partial<CategoryConfig>
): CategoryListResult {
    const index = categories.findIndex((category) => category.name === oldName);
    if (index === -1) {
        return categories;
    }

    const current = categories[index];
    const nextName = updates.name !== undefined ? normalizeCategoryName(updates.name) : current.name;
    const nextIcon = updates.icon ?? current.icon;

    if (!nextName) {
        return { error: "Category name is required." };
    }
    if (!nextIcon) {
        return { error: "Category icon is required." };
    }
    if (hasDuplicateName(categories, nextName, oldName)) {
        return { error: "Category name already exists." };
    }

    const next = [...categories];
    next[index] = { name: nextName, icon: nextIcon };
    return next;
}

export function resolveAnnotationCategories(
    categories?: CategoryConfig[] | null
): CategoryConfig[] {
    if (!categories || categories.length === 0) {
        return DEFAULT_ANNOTATION_CATEGORIES;
    }
    return categories.filter((category) => category.name && category.icon);
}
