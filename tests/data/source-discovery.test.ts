import {
    hasTag,
    isEligibleSourceTags,
    selectEligibleSourcePaths,
} from "src/data/source-discovery";

describe("source-discovery policy", () => {
    test("selects paths with review and clipping tags", () => {
        const fileTagsMap = new Map<string, string[]>([
            ["Books/Annotations.md", ["review/book"]],
            ["Notes/Personal.md", ["review/note", "daily"]],
            ["Clippings/Article.md", ["clippings"]],
            ["Scratch/Todo.md", ["todo"]],
        ]);

        expect(selectEligibleSourcePaths(fileTagsMap)).toEqual([
            "Books/Annotations.md",
            "Notes/Personal.md",
            "Clippings/Article.md",
        ]);
    });

    test("isEligibleSourceTags matches any eligible tag", () => {
        expect(isEligibleSourceTags(["daily", "review/book"])).toBe(true);
        expect(isEligibleSourceTags(["clippings"])).toBe(true);
        expect(isEligibleSourceTags(["daily", "todo"])).toBe(false);
    });

    test("hasTag normalizes duplicates and whitespace", () => {
        expect(hasTag([" clippings ", "clippings", "review/note"], "clippings")).toBe(true);
        expect(hasTag(["review/book"], "clippings")).toBe(false);
    });
});
