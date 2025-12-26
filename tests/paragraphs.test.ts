import type { Flashcard } from "src/data/models/flashcard";
import { extractParagraphs } from "src/data/models/paragraphs";
import { nanoid } from "nanoid";
import { mocked } from "jest-mock";

jest.mock("../src/main");

// eslint-disable-next-line @typescript-eslint/no-empty-function
jest.mock("../src/data/disk", () => {
    return {
        getMetadataForFile: (_path: string) => {
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
            };
        },
        getFileContents: (_path: string) => {
            return `# Chapter 3: Pulling the rabbit out of the hat

## Relating study and test

What is episodic memory?
NO one knows ^hjhjhlkap`;
        }
    };
});

const mockedNanoid = mocked(nanoid, true);

describe("extractParagraphs", () => {
    beforeEach(async () => {
        let value = 0;
        mockedNanoid.mockImplementation((_size?: number) => (value++).toString());
    });
    test("should extract an array of headers from text", async () => {
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
    afterEach(() => {
        jest.restoreAllMocks();
    });
});