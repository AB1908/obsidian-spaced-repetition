import { parseMoonReaderExport } from "src/data/import/moonreader";

describe("MoonReader Parser - Snapshot Test", () => {
    test("should correctly parse a real mrexpt file with bookmarks, chapter markers, and annotations", () => {
        const realFileContent = `851272
indent:true
trim:false
#
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
#
5682
Memory: A Very Short Introduction
/sdcard/Books/MoonReader/Memory A Very Short Introduction by Jonathan K. Foster.epub
/sdcard/books/moonreader/memory a very short introduction by jonathan k. foster.epub
2
0
0
29
-11184811
1645535325744

#
Chapter 1<BR>You are your memory
0
0
0
#
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

        const result = parseMoonReaderExport(realFileContent);
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "chapter": "Chapter 1: You are your memory",
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

    test("should correctly parse multi-line highlights and notes with <BR> tags", () => {
        const fileContentWithBR = `#
1234
Test Book
path
lpath
1
0
0
0
0
0
This is the first line of the highlight.<BR>This is the second line.
This is the first line of the note.<BR>This is the second line.
(extra text field)
0
0
0
`;
        const result = parseMoonReaderExport(fileContentWithBR);
        expect(result).toMatchInlineSnapshot(`
            [
              {
                "chapter": "1",
                "characters": "0",
                "color": "0",
                "highlight": "(extra text field)",
                "id": "1234",
                "location": "0",
                "lpath": "lpath",
                "note": "This is the first line of the note.
            This is the second line.",
                "p1": "0",
                "path": "path",
                "timestamp": "0",
                "title": "Test Book",
              },
            ]
        `);
    });
});
