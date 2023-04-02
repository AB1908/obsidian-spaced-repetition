import { extractSchedulingArray } from "src/DeckBuilder";

test("scheduling", () => {
    expect(extractSchedulingArray("Test?\n?\nTest\n<!--SR:!2022-11-24,4,270-->"))
        .toMatchInlineSnapshot(`
        Array [
          Array [
            "!2022-11-24,4,270",
            "2022-11-24",
            "4",
            "270",
          ],
        ]
    `);
});
