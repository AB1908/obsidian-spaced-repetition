import { bookSections, findNextHeader, findPreviousHeaderForHeading } from "src/data/models/sourceNote";
import { beforeEach } from "@jest/globals";
import { sampleAnnotationMetadata, sampleAnnotationText } from "./disk.test";
import type { SectionCache } from "obsidian";
import type { Flashcard } from "src/data/models/flashcard";
import { getFileContents } from "src/data/disk";
import { extractParagraphs } from "src/data/models/paragraphs";


jest.mock("../src/main", () => {});

jest.mock("nanoid", () => ({
    nanoid: () => "deterministic-id",
}));

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/data/disk", () => {
    return {
        getMetadataForFile: (path: string) => {
            return {
                "headings": [
                    {
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 0,
                                "col": 46,
                                "offset": 46
                            }
                        },
                        "heading": "Chapter 3: Pulling the rabbit out of the hat",
                        "level": 1
                    },
                    {
                        "position": {
                            "start": {
                                "line": 2,
                                "col": 0,
                                "offset": 48
                            },
                            "end": {
                                "line": 2,
                                "col": 26,
                                "offset": 74
                            }
                        },
                        "heading": "Relating study and test",
                        "level": 2
                    }
                ],
                "sections": [
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 0,
                                "col": 0,
                                "offset": 0
                            },
                            "end": {
                                "line": 0,
                                "col": 46,
                                "offset": 46
                            }
                        }
                    },
                    {
                        "type": "heading",
                        "position": {
                            "start": {
                                "line": 2,
                                "col": 0,
                                "offset": 48
                            },
                            "end": {
                                "line": 2,
                                "col": 26,
                                "offset": 74
                            }
                        }
                    },
                    {
                        "type": "paragraph",
                        "position": {
                            "start": {
                                "line": 4,
                                "col": 0,
                                "offset": 76
                            },
                            "end": {
                                "line": 5,
                                "col": 23,
                                "offset": 124
                            }
                        },
                        "id": "hjhjhlkap"
                    }
                ],
                "blocks": {
                    "hjhjhlkap": {
                        "position": {
                            "start": {
                                "line": 4,
                                "col": 0,
                                "offset": 76
                            },
                            "end": {
                                "line": 5,
                                "col": 23,
                                "offset": 124
                            }
                        },
                        "id": "hjhjhlkap"
                    }
                }
            }
        },
        getFileContents: (path: string) => {
            return `# Chapter 3: Pulling the rabbit out of the hat

## Relating study and test

What is episodic memory?
NO one knows ^hjhjhlkap`;
        }
    }
});

test("getParagraphFromFile", async () => {
    const flashcards = [
        {
            "annotationId": "93813",
            "answerText": "This is an answer",
            "cardType": 2,
            "context": null,
            "dueDate": null,
            "ease": null,
            "flag": null,
            "id": "b4cYyMuF",
            "interval": null,
            "parsedCardId": "aaaaaaaa",
            "questionText": "This is a question",
            "siblings": []
        }
    ];
    expect(await extractParagraphs("", flashcards as unknown as Flashcard[])).toMatchSnapshot();
    flashcards[0].annotationId = "hjhjhlkap";
    expect(await extractParagraphs("", flashcards as unknown as Flashcard[])).toMatchSnapshot();
});

// const t = [
//   {
//     "children": [],
//     "counts": {
//       "with": 0,
//       "without": 0,
//     },
//     "id": "0",
//     "level": 1,
//     "name": "Chapter 3: Pulling the rabbit out of the hat",
//   },
//   {
//     "children": [],
//     "counts": {
//       "with": 0,
//       "without": 0,
//     },
//     "id": "1",
//     "level": 2,
//     "name": "Relating study and test",
//   },
//   {
//     "hasFlashcards": false,
//     "id": "hjhjhlkap",
//     "text": `What is episodic memory?
// NO one knows ^hjhjhlkap`,
//     "wasIdPresent": true,
//   },
// ];