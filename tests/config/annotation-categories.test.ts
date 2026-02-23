import {
    addCategoryToList,
    editCategoryInList,
    removeCategoryFromList,
    reorderCategoryInList,
    type CategoryConfig,
} from "src/config/annotation-categories";

describe("annotation-categories CRUD helpers", () => {
    const baseCategories: CategoryConfig[] = [
        { name: "insight", icon: "lightbulb" as any },
        { name: "quote", icon: "quote" as any },
        { name: "note", icon: "sticky-note" as any },
    ];

    it("addCategoryToList adds a new category to the list", () => {
        expect(
            addCategoryToList(baseCategories, { name: "memory", icon: "star" as any })
        ).toEqual([...baseCategories, { name: "memory", icon: "star" }]);
    });

    it("addCategoryToList returns error when name already exists", () => {
        expect(
            addCategoryToList(baseCategories, { name: "quote", icon: "star" as any })
        ).toEqual({ error: expect.any(String) });
    });

    it("addCategoryToList returns error when name is empty", () => {
        expect(
            addCategoryToList(baseCategories, { name: "   ", icon: "star" as any })
        ).toEqual({ error: expect.any(String) });
    });

    it("removeCategoryFromList removes the named category", () => {
        expect(removeCategoryFromList(baseCategories, "quote")).toEqual([
            { name: "insight", icon: "lightbulb" },
            { name: "note", icon: "sticky-note" },
        ]);
    });

    it("removeCategoryFromList is a no-op when name not found", () => {
        expect(removeCategoryFromList(baseCategories, "missing")).toEqual(baseCategories);
    });

    it("reorderCategoryInList moves category up", () => {
        expect(reorderCategoryInList(baseCategories, "quote", "up")).toEqual([
            { name: "quote", icon: "quote" },
            { name: "insight", icon: "lightbulb" },
            { name: "note", icon: "sticky-note" },
        ]);
    });

    it("reorderCategoryInList moves category down", () => {
        expect(reorderCategoryInList(baseCategories, "quote", "down")).toEqual([
            { name: "insight", icon: "lightbulb" },
            { name: "note", icon: "sticky-note" },
            { name: "quote", icon: "quote" },
        ]);
    });

    it("reorderCategoryInList is a no-op at boundary", () => {
        expect(reorderCategoryInList(baseCategories, "insight", "up")).toEqual(baseCategories);
        expect(reorderCategoryInList(baseCategories, "note", "down")).toEqual(baseCategories);
    });

    it("editCategoryInList renames a category", () => {
        expect(editCategoryInList(baseCategories, "quote", { name: "quotation" })).toEqual([
            { name: "insight", icon: "lightbulb" },
            { name: "quotation", icon: "quote" },
            { name: "note", icon: "sticky-note" },
        ]);
    });

    it("editCategoryInList swaps icon", () => {
        expect(editCategoryInList(baseCategories, "quote", { icon: "star" as any })).toEqual([
            { name: "insight", icon: "lightbulb" },
            { name: "quote", icon: "star" },
            { name: "note", icon: "sticky-note" },
        ]);
    });

    it("editCategoryInList returns error when new name conflicts", () => {
        expect(editCategoryInList(baseCategories, "quote", { name: "insight" })).toEqual({
            error: expect.any(String),
        });
    });
});
