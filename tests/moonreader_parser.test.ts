import { parseMoonReaderExport } from "src/data/import/moonreader";

describe("MoonReader Parser - Comprehensive Test", () => {
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

        // We expect only 1 annotation in the output:
        // - Record 1 (ID 3756) is a bookmark and should be skipped.
        // - Record 2 (ID 5682) is a chapter marker and should be filtered out after setting the chapter name.
        // - Only Record 3 (ID 5684) should remain, with its chapter name set.
        expect(result).toHaveLength(1);

        // Test the remaining annotation (ID 5684)
        const finalAnnotation = result[0];
        expect(finalAnnotation.id).toBe("5684");
        expect(finalAnnotation.title).toBe("Memory: A Very Short Introduction");
        expect(finalAnnotation.chapter).toBe("Chapter 1: You are your memory"); // From the chapter marker
        expect(finalAnnotation.highlight).toBe("What is episodic memory?");
        expect(finalAnnotation.note).toBe("this is termed episodic memory).");
        expect(finalAnnotation.timestamp).toBe("1644740371668");
        // Ensure other fields are correctly parsed as well
        expect(finalAnnotation.location).toBe("5736");
        expect(finalAnnotation.characters).toBe("32");
        expect(finalAnnotation.color).toBe("-11184811");
    });
});
