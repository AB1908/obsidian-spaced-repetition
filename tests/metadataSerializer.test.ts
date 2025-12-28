import { serializeMetadata } from "src/data/utils/metadataSerializer";

describe("serializeMetadata", () => {
    test("should serialize only deleted: true", () => {
        expect(serializeMetadata({ deleted: true })).toMatchInlineSnapshot(`"deleted: true"`);
    });
});
