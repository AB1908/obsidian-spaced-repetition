import { parseMoonReaderExport } from "src/data/import/moonreader";

describe("MoonReader Parser", () => {
    test("should parse a single highlight correctly", () => {
        const mockExport = `#
12345
The Great Gatsby
/sdcard/Books/gatsby.epub
/storage/emulated/0/Books/gatsby.epub
Chapter 1
0
100
15
-16711681
1609459200000
In my younger and more vulnerable years my father gave me some advice...
Always try to see the best in people.`;

        const result = parseMoonReaderExport(mockExport);

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual({
            id: "12345",
            title: "The Great Gatsby",
            path: "/sdcard/Books/gatsby.epub",
            lpath: "/storage/emulated/0/Books/gatsby.epub",
            chapter: "Chapter 1",
            p1: "0",
            location: "100",
            characters: "15",
            color: "-16711681",
            timestamp: "1609459200000",
            highlight: "In my younger and more vulnerable years my father gave me some advice...",
            note: "Always try to see the best in people.",
        });
    });

    test("should parse multiple highlights correctly", () => {
        const mockExport = `#
1
Book 1
path1
lpath1
Chap 1
0
10
5
color1
time1
Highlight 1
Note 1
#
2
Book 1
path1
lpath1
Chap 2
0
20
8
color2
time2
Highlight 2
Note 2`;

        const result = parseMoonReaderExport(mockExport);

        expect(result).toHaveLength(2);
        expect(result[0].id).toBe("1");
        expect(result[1].id).toBe("2");
        expect(result[0].highlight).toBe("Highlight 1");
        expect(result[1].note).toBe("Note 2");
    });

    test("should handle missing note correctly", () => {
        const mockExport = `#
1
Book 1
path1
lpath1
Chap 1
0
10
5
color1
time1
Highlight 1`;

        const result = parseMoonReaderExport(mockExport);

        expect(result).toHaveLength(1);
        expect(result[0].note).toBe("");
    });

    test("should handle empty lines between timestamp and highlight", () => {
        const sample = `#
5688
Memory: A Very Short Introduction
/sdcard/Books/MoonReader/Memory A Very Short Introduction by Jonathan K. Foster.epub
/sdcard/books/moonreader/memory a very short introduction by jonathan k. foster.epub
2
0
10434
209
-11184811
1644740833153


Thinking along these lines has led many contemporary researchers to regard the mechanisms underlying memory as being best characterized as a dynamic activity or process rather than as a static entity or thing.
0
0
0`;

        const result = parseMoonReaderExport(sample);

        expect(result).toHaveLength(1);
        expect(result[0].highlight).toEqual("Thinking along these lines has led many contemporary researchers to regard the mechanisms underlying memory as being best characterized as a dynamic activity or process rather than as a static entity or thing.");
        expect(result[0].timestamp).toBe("1644740833153");
    });
});
