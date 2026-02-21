import { deserializeMetadata, serializeMetadata } from "src/data/utils/metadataSerializer";

describe("metadataSerializer", () => {
    test("serializes string category names in metadata", () => {
        expect(serializeMetadata({ category: "insight" as any })).toContain("category: insight");
    });

    test("ignores legacy numeric category metadata values", () => {
        expect(deserializeMetadata("category: 2")).toEqual({});
    });

    test("should serialize only deleted: true", () => {
        expect(serializeMetadata({ deleted: true })).toBe("deleted: true");
    });
});
