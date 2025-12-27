import { parseMoonReaderExport } from "src/data/import/moonreader";

describe("MoonReader Parser - Snapshot Testing", () => {
    test("should correctly parse a regular annotation", () => {
        const regularAnnotationRecord = `#
5684
Memory: A Very Short Introduction
/sdcard/Books/MoonReader/Memory A Very Short Introduction by Jonathan K. Foster.epub
/sdcard/books/moonreader/memory a very short introduction by jonathan k. foster.epub
2
0
5736
32
-11184811
1644740371668

What is episodic memory?
this is termed episodic memory).
0
0
0
`;
        const result = parseMoonReaderExport(regularAnnotationRecord);
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "chapter": "2",
                "characters": "32",
                "color": "-11184811",
                "highlight": "this is termed episodic memory).",
                "id": "5684",
                "location": "5736",
                "lpath": "/sdcard/books/moonreader/memory a very short introduction by jonathan k. foster.epub",
                "note": "What is episodic memory?",
                "p1": "0",
                "path": "/sdcard/Books/MoonReader/Memory A Very Short Introduction by Jonathan K. Foster.epub",
                "timestamp": "1644740371668",
                "title": "Memory: A Very Short Introduction",
              },
            ]
        `);
    });

    test("should skip a bookmark annotation", () => {
        const bookmarkRecord = `#
3756
Memory A Very Short Introduction by Jonathan K. Foster.epub
/sdcard/Books/MoonReader/Memory A Very Short Introduction by Jonathan K. Foster.epub
/sdcard/books/moonreader/memory a very short introduction by jonathan k. foster.epub
3
0
33512
0
-11184811
1645267528513
(32.8%) Implicit memory, by contrast, refers to an influence on behaviour, feelings or thoughts as a result...


0
0
0
`;
        const result = parseMoonReaderExport(bookmarkRecord);
        expect(result).toMatchInlineSnapshot(`[]`);
    });
});
